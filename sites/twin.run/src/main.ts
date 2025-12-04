// sort-imports-ignore
import 'vscode';
import 'vscode/localExtensionHost';
// MARK: VSCode
import '@codingame/monaco-vscode-theme-defaults-default-extension';

// MARK: NPM
import '@codingame/monaco-vscode-npm-default-extension';

// MARK: Markdown
import '@codingame/monaco-vscode-json-default-extension';

// Typescript
// import '@codingame/monaco-vscode-javascript-default-extension';
import '@codingame/monaco-vscode-standalone-typescript-language-features';
import '@codingame/monaco-vscode-typescript-basics-default-extension';

// VSCode API for file system operations
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';

import * as Effect from 'effect/Effect';
// Import Monaco Language Client components
import { MonacoFsLive } from './services/FS.service';
import { MonacoContext, MonacoContextLive } from './services/Monaco.service';

const mainProgram = Effect.gen(function* () {
  const context = yield* MonacoContext;

  yield* context.startEditorApp;
}).pipe(
  Effect.provide(MonacoContextLive),
  Effect.provide(MonacoFsLive),
  Effect.onError((error) => Effect.log('ERROR: ', error)),
);

Effect.runFork(mainProgram);
