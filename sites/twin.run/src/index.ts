import * as monaco from 'monaco-editor';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
// import '@codingame/monaco-vscode-standalone-languages';
// import '@codingame/monaco-vscode-standalone-typescript-language-features';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-npm-default-extension';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { clientManager } from './client/client.manager';
// import './workers/ts.worker';
// import workerUrl from './workers/twin.worker?worker&url';

import 'vscode/localExtensionHost';

// import { createLanguageClient } from './client/twin.ls';

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

  // createLanguageClient();
  // const document = vscode.workspace.openTextDocument(twinFile.uri.fsPath);
  // await clientManager.wrapper.start(clientManager.HTMLElement);
  const worker = await monaco.languages.getLanguages();
  console.log(await worker);
  console.log("COMPILED: ", await clientManager.compileCode('asd'))
  // console.log('OPEN_DOC: ', document.getText());
};

// export const loadTwinWorker = () => {
//   console.log(`Create Twin worker`);
//   return new Worker(workerUrl, {
//     type: 'module',
//     name: 'Twin LS',
//   });
// };
