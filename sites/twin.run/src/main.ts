// sort-imports-ignore
import 'vscode';
import 'vscode/localExtensionHost';
// MARK: VSCode
import '@codingame/monaco-vscode-theme-defaults-default-extension';

// MARK: NPM
import '@codingame/monaco-vscode-npm-default-extension';

// MARK: CSS
import '@codingame/monaco-vscode-standalone-css-language-features';
import '@codingame/monaco-vscode-css-language-features-default-extension';
import '@codingame/monaco-vscode-css-default-extension';

// MARK: Markdown
import '@codingame/monaco-vscode-markdown-basics-default-extension';
import '@codingame/monaco-vscode-markdown-language-features-default-extension';

// MARK: JSON
import '@codingame/monaco-vscode-json-default-extension';

// MARK: HTML
import '@codingame/monaco-vscode-standalone-html-language-features';
import '@codingame/monaco-vscode-html-language-features-default-extension';
import '@codingame/monaco-vscode-html-default-extension';

// Typescript
// import '@codingame/monaco-vscode-javascript-default-extension';
import '@codingame/monaco-vscode-standalone-typescript-language-features';
import '@codingame/monaco-vscode-typescript-basics-default-extension';

// VSCode API for file system operations
import '@codingame/monaco-vscode-typescript-language-features-default-extension';
import '@codingame/monaco-vscode-typescript-language-features-default-extension';

import { setup } from '@native-twin/core';
import * as Effect from 'effect/Effect';
import twinConfig from '../tailwind.config';
import { MainLayer, MonacoRuntime } from './services/App.runtime';
import { StartEditorUIProgram } from './services/EditorUI.service';

// Import Monaco Language Client components
// import { MonacoContext } from './services/Monaco.service';

const mainProgram = Effect.gen(function* () {
  // const context = yield* MonacoContext;

  // yield* context.startEditorApp;
  setup(twinConfig);
  yield* StartEditorUIProgram;
}).pipe(
  Effect.onError((error) => Effect.log('ERROR: ', error)),
  Effect.provide(MainLayer),
);

MonacoRuntime.runFork(mainProgram);
