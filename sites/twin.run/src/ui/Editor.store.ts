import * as vscode from 'vscode';
import { createStore } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
// import * as Effect from 'effect/Effect';
import type { editor } from 'monaco-editor';
import { useSyncExternalStore } from 'react';

interface EditorStore {
  preview: { code: string; css: string };
  isReady: boolean;
  currentEditor: editor.IStandaloneCodeEditor | null;
}

export const editorStore = createStore<EditorStore>({
  currentEditor: null,
  isReady: false,
  preview: { code: '', css: '' },
});

export const useEditorStore = () =>
  useSyncExternalStore(
    editorStore.subscribe,
    () => editorStore.getState(),
    () => editorStore.getState(),
  );

export const useStoreSelector = <A>(selector: (store: EditorStore) => A) =>
  useSyncExternalStore(
    editorStore.subscribe,
    () => selector(editorStore.getState()),
    () => selector(editorStore.getState()),
  );

export const subscribeCurrentEditor = <E = never, R = never>(
  onChange: (event: vscode.TextDocumentChangeEvent) => Effect.Effect<void, E, R>,
) =>
  Effect.gen(function* () {
    return yield* Stream.async<vscode.TextDocumentChangeEvent>((emit) => {
      const s = vscode.workspace.onDidChangeTextDocument((e) => {
        emit.single(e);
      });
      return Effect.sync(() => s.dispose());
    }).pipe(Stream.forever, Stream.runForEach(onChange));
  });
