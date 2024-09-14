import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { MonacoEditorReactComp } from '@typefox/monaco-editor-react';
import { globalEditorConfig } from '@/editor/EditorConfig.service';
import typingsWorker from '@/lsp/workers/typings.worker?worker&url';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import * as RA from 'effect/Array';
import * as EffectWorker from '@effect/platform/Worker';
import * as BrowserWorker from '@effect/platform-browser/BrowserWorker';
import { pipe } from 'effect/Function';
import { GetPackageTypings } from '@/lsp/workers/shared.schemas';

const workspacePrefix = 'file:///';
function detectLanguage(path: string) {
  const ext = path.replace(/^.+\.([^.]+)$/, '$1');

  if (/^[cm]?[jt]sx?$/.test(ext)) {
    return 'typescript';
  }

  return ext;
}

export function getOrCreateModel(path: string, defaultValue = '') {
  const uri = monaco.Uri.parse(new URL(path, workspacePrefix).href);

  return (
    monaco.editor.getModel(uri) ||
    monaco.editor.createModel(defaultValue, detectLanguage(path) ?? 'typescript', uri)
  );
}

const typingsWorkerLayer = BrowserWorker.layer(
  () => new globalThis.Worker(typingsWorker, { type: 'module' }),
);
const typingsWorkerMaker = (packages: GetPackageTypings[]) =>
  Effect.gen(function* () {
    const pool = yield* EffectWorker.makePoolSerialized({
      size: 1,
    });

    return yield* pipe(
      packages,
      Stream.fromIterable,
      Stream.flatMap((x) => pool.execute(x)),
      Stream.mapEffect((response) =>
        Effect.gen(function* () {
          console.log(
            'TYPINGS: ',
            response.typings.map((x) => x.filePath),
          );
          const disposables = pipe(
            response.typings,
            RA.map((typing) =>
              monaco.languages.typescript.typescriptDefaults.addExtraLib(
                typing.contents,
                typing.filePath,
              ),
            ),
          );
          const models = yield* pipe(
            response.typings,
            RA.map((typing) =>
              Effect.sync(() => getOrCreateModel(typing.filePath, typing.contents)),
            ),
            Effect.all,
          );

          return { disposables, models };
        }),
      ),
      Stream.runCollect,
    );
  }).pipe(Effect.scoped, Effect.provide(typingsWorkerLayer), Effect.runPromise);

export const useEditor = () => {
  const config = useRef(globalEditorConfig);
  const editorRef = useRef<MonacoEditorReactComp>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const wrapper = editor.getEditorWrapper();

    typingsWorkerMaker([
      new GetPackageTypings({
        name: '@native-twin/core',
        version: '6.4.0',
      }),
      new GetPackageTypings({
        name: '@native-twin/css',
        version: '6.4.0',
      }),
      new GetPackageTypings({
        name: '@native-twin/preset-tailwind',
        version: '6.4.0',
      }),
      new GetPackageTypings({
        name: '@native-twin/arc-parser',
        version: '6.4.0',
      }),
      new GetPackageTypings({
        name: '@native-twin/helpers',
        version: '6.4.0',
      }),
    ]).then(() => {
      console.log(
        'LIBS: ',
        monaco.languages.typescript.typescriptDefaults.getExtraLibs(),
      );
    });
    return () => {
      wrapper.dispose();
      console.log('DISPOSE');
    };
  }, []);

  return {
    config,
    editorRef,
  };
};
