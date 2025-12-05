import * as vscode from "vscode";
import { cx } from "@native-twin/core";
// import * as RA from "effect/Array";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
// import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { MonacoRuntime } from "../services/App.runtime";
import { MonacoContext } from "../services/Monaco.service";
import {
  editorStore,
  subscribeCurrentEditor,
  useStoreSelector,
} from "./Editor.store";

export const useEditorApp = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState("preview");
  const currentEditor = useStoreSelector((x) => x.currentEditor);
  const previewCode = useStoreSelector((x) => x.preview.code);
  const previewCss = useStoreSelector((x) => x.preview.css);

  useEffect(() => {
    return () => {
      currentEditor?.dispose();
    };
  }, [currentEditor]);

  useEffect(() => {
    if (!editorRef.current) return;

    const fiber = MonacoContext.pipe(
      Effect.andThen((ctx) => {
        console.log("editorRef.current", editorRef.current);
        return Effect.zipRight(
          ctx.startEditorApp(editorRef.current!),
          ctx.editorApp
        );
      }),
      Effect.tap(() => Effect.log("Editor started")),
      Effect.andThen((app) => {
        app.updateLayout(
          {
            width: window.innerWidth * 0.6,
            height: window.innerHeight,
          },
          true
        );
        return editorStore.setState((x) => ({
          currentEditor: app.getEditor() ?? null,
          isReady: true,
          preview: x.preview,
        }));
      }),
      Effect.andThen(() =>
        subscribeCurrentEditor(({ document }) =>
          Effect.gen(function* () {
            const ctx = yield* MonacoContext;
            // yield* Effect.log("File changed", document.getText());

            const { css, regions } = yield* ctx.getCompilerResultFromLSP(
              document.uri
            );

            const workspaceEdit = new vscode.WorkspaceEdit();
            for (const x of regions) {
              const vscodeRange = new vscode.Range(
                new vscode.Position(
                  x.range.start.line,
                  x.range.start.character
                ),
                new vscode.Position(x.range.end.line, x.range.end.character)
              );
              const text = document.getText(vscodeRange);
              const newText = cx`${text}`;
              if (newText === text) {
                continue;
              }
              workspaceEdit.replace(document.uri, vscodeRange, newText);
            }

            yield* Effect.promise(() =>
              vscode.workspace.applyEdit(workspaceEdit, {
                isRefactoring: false,
              })
            );

            editorStore.setState((x) => ({
              ...x,
              preview: { code: document.getText(), css },
            }));
          }).pipe(
            Effect.catchAll((error) => Effect.log("Compiler_ERROR: ", error))
          )
        )
      ),
      MonacoRuntime.runFork
    );

    return () => {
      console.log("DISPOSE");
      MonacoRuntime.runPromise(Fiber.interrupt(fiber)).then(() =>
        console.log("Interrupted current model")
      );
    };
  }, []);

  return {
    editorRef,
    code: previewCode,
    css: previewCss,
    currentEditor,
    stage,
    setStage,
  };
};

// const edits = regions.map((x) => {
//   const monacoRange = monaco.Range.fromPositions(
//     {
//       column: x.range.start.character + 1,
//       lineNumber: x.range.start.line + 1,
//     },
//     {
//       column: x.range.end.character + 1,
//       lineNumber: x.range.end.line + 1,
//     }
//   );
//   const vscodeRange = new vscode.Range(
//     new vscode.Position(
//       x.range.start.line,
//       x.range.start.character
//     ),
//     new vscode.Position(x.range.end.line, x.range.end.character)
//   );

//   const monacoEdit: monaco.editor.ISingleEditOperation = {
//     range: monacoRange,
//     text: cx`${model.getValueInRange(monacoRange)}`,
//     forceMoveMarkers: true,
//   };
//   const vscodeEdit = vscode.TextEdit.replace(
//     vscodeRange,
//     document.getText(vscodeRange)
//   );

//   return {
//     token: x,
//     vscodeRange,
//     monacoRange,
//     vscodeText: document.getText(vscodeRange),
//     monacoText: model.getValueInRange(monacoRange),
//     monacoEdit,
//     vscodeEdit,
//   };
// });
