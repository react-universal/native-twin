// // sort-imports-ignore
// import 'vscode';
// import 'vscode/localExtensionHost';
// // MARK: VSCode
// import '@codingame/monaco-vscode-theme-defaults-default-extension';

// // MARK: NPM
// import '@codingame/monaco-vscode-npm-default-extension';

// // MARK: CSS
// import '@codingame/monaco-vscode-standalone-css-language-features';
// import '@codingame/monaco-vscode-css-language-features-default-extension';
// import '@codingame/monaco-vscode-css-default-extension';

// // MARK: Markdown
// import '@codingame/monaco-vscode-markdown-basics-default-extension';
// import '@codingame/monaco-vscode-markdown-language-features-default-extension';

// // MARK: JSON
// import '@codingame/monaco-vscode-json-default-extension';

// // MARK: HTML
// import '@codingame/monaco-vscode-standalone-html-language-features';
// import '@codingame/monaco-vscode-html-language-features-default-extension';
// import '@codingame/monaco-vscode-html-default-extension';

// // Typescript
// // import '@codingame/monaco-vscode-javascript-default-extension';
// // import '@codingame/monaco-vscode-standalone-typescript-language-features';
// import {
//   getTypeScriptWorker,
//   typescriptDefaults,
// } from '@codingame/monaco-vscode-standalone-typescript-language-features';
// import '@codingame/monaco-vscode-typescript-basics-default-extension';

// // Typescript extension (typings also typings installer)
// import '@codingame/monaco-vscode-typescript-language-features-default-extension';

// import { DevTools } from '@effect/experimental';
// import * as BrowserRuntime from '@effect/platform-browser/BrowserRuntime';
// import { setup } from '@native-twin/core';
// import * as RA from 'effect/Array';
// import * as Effect from 'effect/Effect';
// // VSCode API for file system operations
// // import * as monaco from 'monaco-editor';
// import twinConfig from '../tailwind.config';
// import { MainLayer } from './services/App.runtime';
// import { AppWorkers } from './services/AppWorkers.service';
// import { StartEditorUIProgram } from './services/EditorUI.service';
// import { MonacoFs } from './services/FS.service';
// import { registerEditorLanguages, setTypescriptDefaults } from './utils/editor.utils';
// import { GetPackageTypings } from './workers/shared.schemas';

// // Import Monaco Language Client components
// // import { MonacoContext } from './services/Monaco.service';

// const mainProgram = Effect.gen(function* () {
//   const { installDefinitions } = yield* AppWorkers;
//   const fs = yield* MonacoFs;

//   setup(twinConfig);
//   yield* StartEditorUIProgram;
//   const typings = yield* installDefinitions([
//     GetPackageTypings.make({
//       name: '@types/react',
//       version: '18.2.0',
//     }),
//     GetPackageTypings.make({
//       name: 'react',
//       version: '18.2.0',
//     }),
//   ]);
//   console.log('TYPINGS: ', RA.fromIterable(typings));
//   for (const t of RA.flatten(RA.fromIterable(typings).map((x) => x.typings))) {
//     const uri = fs.paths.getPathUri(t.filePath.replace('/', ''));
//     yield* fs.createFile(uri, t.contents);
//     if (t.filePath.endsWith('.ts')) {
//       typescriptDefaults.addExtraLib(t.contents, t.filePath);
//     } else {
//       console.log('NOT_TYPING: ', t);
//     }
//     // const model =
//     // monaco.editor.getModel(uri) || monaco.editor.createModel(t.contents, 'typescript', uri);
//   }
//   registerEditorLanguages();
//   setTypescriptDefaults();
//   // const tsWorker = yield* Effect.promise(() => worker());
//   // const worker = yield* Effect.promise(() => getTypeScriptWorker());
//   // console.log('WORKER: ', { tsWorker });
// }).pipe(
//   Effect.scoped,
//   Effect.onError((error) => Effect.log('ERROR: ', error)),
//   Effect.uninterruptible,
//   Effect.provide(MainLayer),
// );

// // MonacoRuntime.runFork(mainProgram);
// BrowserRuntime.runMain(mainProgram.pipe(Effect.provide(DevTools.layer('ws://localhost:34437'))), {
//   disableErrorReporting: false,
//   disablePrettyLogger: false,
//   teardown: (exit) => {
//     console.log('EXITED: ', exit);
//   },
// });
