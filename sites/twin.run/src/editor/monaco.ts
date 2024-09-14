/* eslint-disable react-hooks/rules-of-hooks */
import 'vscode';
import * as monaco from 'monaco-editor';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-standalone-languages';
import '@codingame/monaco-vscode-standalone-typescript-language-features';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-npm-default-extension';
// import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import editorWorker from 'monaco-editor-wrapper/workers/module/editor?worker';
import jsonWorker from 'monaco-editor-wrapper/workers/module/json?worker';
import cssWorker from 'monaco-editor-wrapper/workers/module/css?worker';
import htmlWorker from 'monaco-editor-wrapper/workers/module/html?worker';
import tsWorker from 'monaco-editor-wrapper/workers/module/ts?worker';

export * from 'monaco-editor';

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

// export const configureMonacoWorkers = () => {
//   useWorkerFactory({
//     ignoreMapping: true,
//     workerLoaders: {
//       editorWorkerService: () =>
//         new Worker(
//           new URL('monaco-editor-wrapper/workers/module/editor', import.meta.url),
//           { type: 'module' },
//         ),
//       typescript: () =>
//         new Worker(new URL('monaco-editor-wrapper/workers/module/ts', import.meta.url), {
//           type: 'module',
//         }),
//       json: () =>
//         new Worker(
//           new URL('monaco-editor-wrapper/workers/module/json', import.meta.url),
//           {
//             type: 'module',
//           },
//         ),
//     },
//   });
//   (() => {
//     monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
//   })();
// };

export const workspacePrefix = 'file:///';

export function detectLanguage(path: string) {
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
