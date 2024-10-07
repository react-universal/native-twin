// sort-imports-ignore
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-markdown-language-features-default-extension';
import '@codingame/monaco-vscode-npm-default-extension';
import '@codingame/monaco-vscode-standalone-html-language-features';
import '@codingame/monaco-vscode-standalone-languages';
import '@codingame/monaco-vscode-standalone-typescript-language-features';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import * as monaco from 'monaco-editor';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { TwinEditorService } from './layers/Editor.layer';
import { LanguageClientService } from './layers/Language.layer';
import editorWorker from 'monaco-editor-wrapper/workers/module/editor?worker';
import jsonWorker from 'monaco-editor-wrapper/workers/module/json?worker';
import cssWorker from 'monaco-editor-wrapper/workers/module/css?worker';
import htmlWorker from 'monaco-editor-wrapper/workers/module/html?worker';
import tsWorker from 'monaco-editor-wrapper/workers/module/ts?worker';
import { FileSystemService } from './layers/FileSystem.layer';
import { asArray } from '@native-twin/helpers';
import { TwinEditorConfigService } from './layers/Editor.config';

let editorWorkerCache: Worker | null = null;

const MainLive = TwinEditorService.Live.pipe(
  Layer.provideMerge(LanguageClientService.Live),
  Layer.provideMerge(FileSystemService.Live),
  Layer.provideMerge(TwinEditorConfigService.Live),
);

const program = Effect.gen(function* () {
  const { makeEditor, getMonacoApp } = yield* TwinEditorService;
  const { twinTypings } = yield* FileSystemService;
  const { getPackageTypings } = yield* LanguageClientService;

  yield* makeEditor;
  yield* getPackageTypings(twinTypings);

  yield* getMonacoApp().pipe(
    Effect.flatMap((x) => Effect.promise(() => x.awaitReadiness())),
    Effect.map((x) => asArray(x)),
    Effect.orElse(() => Effect.succeed([] as void[])),
  );

  yield* Effect.fromNullable(document.getElementById('first-loading-status')).pipe(
    Effect.map((x) => x.remove()),
    Effect.orElse(() => Effect.void),
  );
});

const runnable = Effect.provide(program, MainLive);

export const main = () => {
  return Effect.runFork(runnable);
};

self.MonacoEnvironment = {
  getWorker: function (_, label) {
    switch (label) {
      case 'json':
        return new jsonWorker();
      case 'typescript':
        return new tsWorker();
      case 'html':
        return new htmlWorker();
      case 'css':
        return new cssWorker();
      case 'editorWorkerService':
        if (!editorWorkerCache) {
          editorWorkerCache = new Worker(
            new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
            { type: 'module' },
          );
        } else {
          console.debug('attempt to recreate the editor worker');
        }
        return editorWorkerCache;
      default:
        return new editorWorker();
    }
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
  module: monaco.languages.typescript.ModuleKind.ESNext,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  isolatedModules: true,
  allowJs: true,
  strict: false,
  skipLibCheck: true,
  allowSyntheticDefaultImports: true,
  disableSourceOfProjectReferenceRedirect: true,
  esModuleInterop: true,
  declarationMap: false,
  skipDefaultLibCheck: true,
});

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSuggestionDiagnostics: true,
  // noSemanticValidation: true,
});
