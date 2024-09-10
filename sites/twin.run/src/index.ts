import * as monaco from 'monaco-editor';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-npm-default-extension';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { clientManager } from './client/client.manager';
import 'vscode/localExtensionHost';

export const configureMonacoWorkers = () => {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
          { type: 'module' },
        ),
      // typescript: () =>
      //   new Worker(new URL('monaco-editor-wrapper/workers/module/ts', import.meta.url), {
      //     type: 'module',
      //   }),
    },
  });
};

export const runBrowserEditor = async () => {
  clientManager.registerLanguages();

  await clientManager.setup();
  const worker = await monaco.languages.getLanguages();
  console.log('LANGUAGES:', await worker);
  console.log('COMPILED: ', await clientManager.compileCode('asd'));
};
