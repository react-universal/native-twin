import * as vscode from 'vscode';
import type { RegisterLocalProcessExtensionResult } from '@codingame/monaco-vscode-api/extensions';
import { type JsxAttributeValueRegion, LSPConstants } from '@native-twin/language-service';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as monaco from 'monaco-editor';
import { EditorApp } from 'monaco-languageclient/editorApp';
import { LanguageClientWrapper } from 'monaco-languageclient/lcwrapper';
import { MonacoVscodeApiWrapper } from 'monaco-languageclient/vscodeApiWrapper';
import { configureProject } from '../config/createConfig';
import { registerEditorLanguages, setTypescriptDefaults } from '../utils/editor.utils';

const make = Effect.gen(function* () {
  const getEditorConfig = yield* Effect.cachedFunction(() =>
    Effect.tryPromise(() => configureProject()),
  );
  const fullConfig = yield* getEditorConfig(document.getElementById('monaco-editor-root')!);

  const apiWrapper = new MonacoVscodeApiWrapper(fullConfig.vscodeApiConfig);
  yield* Effect.tryPromise(() => apiWrapper.start());

  const extensionAPI = apiWrapper.getExtensionRegisterResult(
    LSPConstants.vscodeExtensionName,
  ) as RegisterLocalProcessExtensionResult;
  yield* Effect.tryPromise(() => extensionAPI.setAsDefaultApi());

  const editorApp = new EditorApp(fullConfig.editorAppConfig);

  if (editorApp.isStarted()) {
    yield* Effect.logWarning(`Editor was already started!`, editorApp.reportStatus().join(' '));
    return yield* Effect.fail('Editor already started');
  }

  yield* Effect.tryPromise(() => editorApp.start(document.getElementById('monaco-editor-root')!));

  const lcWrapper = new LanguageClientWrapper(fullConfig.languageClientConfig);
  yield* Effect.promise(() => lcWrapper.start());

  yield* Effect.all([
    Effect.tryPromise(() => vscode.workspace.openTextDocument(fullConfig.reactUri)),
    Effect.tryPromise(() => vscode.workspace.openTextDocument(fullConfig.twinConfigUri)),
  ]);

  registerEditorLanguages();
  setTypescriptDefaults();

  return {
    apiWrapper,
    lcWrapper,
    editorApp,
    fullConfig,
    getModel,
    getCompilerResultFromLSP,
    getCurrentEditor: () => Effect.fromNullable(editorApp.getEditor()),
    getEditorConfig,
  };

  function getModel(uri: vscode.Uri) {
    return Effect.fromNullable(monaco.editor.getModel(uri));
  }

  function getCompilerResultFromLSP(uri: vscode.Uri) {
    return Effect.fromNullable(lcWrapper.getLanguageClient()).pipe(
      Effect.andThen((lc) =>
        Effect.promise(() =>
          lc.sendRequest<{ css: string; regions: JsxAttributeValueRegion[] }>(
            'get.css',
            uri.toString(),
          ),
        ),
      ),
    );
  }
});

export interface MonacoContext extends Effect.Effect.Success<typeof make> {}
export const MonacoContext = Context.GenericTag<MonacoContext>('monaco/ctx');
export const MonacoContextLive = Layer.effect(MonacoContext, make);
