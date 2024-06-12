import '@codingame/monaco-vscode-theme-defaults-default-extension';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-npm-default-extension';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { clientManager } from './client/client.manager';
import workerUrl from './workers/twin.worker?worker&url';

import 'vscode/localExtensionHost';

import './assets/native-twin.vsix';
import { createLanguageClient } from './client/twin.ls';

export const configureMonacoWorkers = () => {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
          { type: 'module' },
        ),
    },
  });
};

export const runBrowserEditor = async () => {
  clientManager.registerLanguages();
  await clientManager.setup();
  clientManager.wrapper.start(clientManager.HTMLElement);
  createLanguageClient();
  console.log(clientManager.wrapper.getLanguageClient());
};

export const loadTwinWorker = () => {
  console.log(`Create Twin worker`);
  return new Worker(workerUrl, {
    type: 'module',
    name: 'Twin LS',
  });
};
