/* eslint-disable react-hooks/rules-of-hooks */
import 'vscode';
import 'monaco-editor';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-standalone-languages';
import '@codingame/monaco-vscode-standalone-typescript-language-features';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-npm-default-extension';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';

export const configureMonacoWorkers = () => {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
          { type: 'module' },
        ),
      typescript: () =>
        new Worker(
          new URL('monaco-editor-wrapper/workers/module/ts', import.meta.url),
          { type: 'module' },
        ),
    },
  });
};
// export const configureMonacoWorkers = () => {
//   self.MonacoEnvironment = {
//     getWorker(workerId, label: string) {
//       console.log('getWorker', workerId, label);
//       if (label === 'typescript' || label === 'javascript') {
//         return new tsWorker();
//       }
//       return new editorWorker();
//     },
//   };

//   // monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
// };
