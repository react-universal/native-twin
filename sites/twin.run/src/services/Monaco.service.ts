// import * as vscode from 'vscode';
import { LogLevel } from '@codingame/monaco-vscode-api';
import editorWorker from '@codingame/monaco-vscode-api/workers/editor.worker?worker&url';
import tsWorker from '@codingame/monaco-vscode-standalone-typescript-language-features/worker?worker&url';
import textMateWorker from '@codingame/monaco-vscode-textmate-service-override/worker?worker&url';
import { LSPConstants } from '@native-twin/language-service/browser';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import type { Logger } from 'monaco-languageclient/common';
import { EditorApp, type EditorAppConfig } from 'monaco-languageclient/editorApp';
import { type LanguageClientConfig, LanguageClientWrapper } from 'monaco-languageclient/lcwrapper';
import {
  type MonacoVscodeApiConfig,
  MonacoVscodeApiWrapper,
} from 'monaco-languageclient/vscodeApiWrapper';
import { useWorkerFactory } from 'monaco-languageclient/workerFactory';
import { registerEditorLanguages, setTypescriptDefaults } from '../utils/editor.utils';
import twinWorkerUrl from '../workers/twin.worker?worker&url';
import { MonacoFs } from './FS.service';

const make = Effect.gen(function* () {
  const htmlElementTarget = document.getElementById('monaco-editor-root')!;
  const vsCodeConfig = yield* createVscodeConfig();
  const languageClientConfig = yield* createLanguageClientConfig();
  const editorConfig = yield* createEditorAppConfig();

  const apiWrapper = yield* Ref.make(new MonacoVscodeApiWrapper(vsCodeConfig));
  const lcWrapper = yield* Ref.make(new LanguageClientWrapper(languageClientConfig));
  const editorApp = yield* Ref.make(new EditorApp(editorConfig));

  const startEditorApp = Effect.gen(function* () {
    yield* apiWrapper.get.pipe(
      Effect.andThen((x) =>
        Effect.promise(() =>
          x.start({ caller: 'MonacoContext', performServiceConsistencyChecks: true }),
        ),
      ),
      Effect.tap(() => Effect.logDebug('Monaco: Monaco api Started')),
    );
    yield* editorApp.get.pipe(
      Effect.andThen((x) => Effect.promise(() => x.start(htmlElementTarget))),
      Effect.tap(() => Effect.logDebug('App: Editor App Started')),
    );
    yield* lcWrapper.get.pipe(
      Effect.andThen((lcWrapper) => Effect.promise(() => lcWrapper.start())),
      Effect.tap(() => Effect.logDebug(`LC: Language client started`)),
    );
    yield* apiWrapper.get.pipe(Effect.andThen((app) => Effect.promise(() => app.initExtensions())));

    registerEditorLanguages();
    setTypescriptDefaults();
  });

  return {
    apiWrapper,
    lcWrapper,
    editorApp,
    startEditorApp,
  };
});

export interface MonacoContext extends Effect.Effect.Success<typeof make> {}
export const MonacoContext = Context.GenericTag<MonacoContext>('monaco/FS');
export const MonacoContextLive = Layer.effect(MonacoContext, make);

const createEditorAppConfig = () =>
  Effect.gen(function* () {
    const fs = yield* MonacoFs;
    const openFirstFile = yield* fs.readFile(fs.paths.react);
    const editorAppConfig: EditorAppConfig = {
      id: 'native.twin',
      logLevel: LogLevel.Debug,
      overrideAutomaticLayout: true,
      codeResources: {
        original: {
          text: openFirstFile,
          enforceLanguageId: 'typescriptreact',
          uri: fs.paths.react.fsPath,
        },
        modified: {
          text: openFirstFile,
          enforceLanguageId: 'typescriptreact',
          uri: fs.paths.react.fsPath,
        },
      },
      editorOptions: {
        theme: 'vs-dark',
        'semanticHighlighting.enabled': true,
      },
    };
    return editorAppConfig;
  });

const createLanguageClientConfig = () =>
  Effect.gen(function* () {
    const fs = yield* MonacoFs;
    const languageClientConfig: LanguageClientConfig = {
      languageId: 'NativeTwin',
      disposeWorker: false,
      logLevel: LogLevel.Debug,
      restartOptions: { keepWorker: true, retries: 2, timeout: 5000 },
      connection: {
        options: {
          $type: 'WorkerDirect',
          worker: new Worker(twinWorkerUrl, {
            type: 'module',
            name: 'twin.worker',
          }),
        },
      },
      clientOptions: {
        initializationOptions: {
          // ...data,
          // ...vscode.workspace.getConfiguration(LSPConstants.vscodeConfigSection),
          twinConfig: fs.paths.twinConfig.path,
          workspaceRoot: fs.paths.workspaceUri.path,
          capabilities: {
            completion: {
              dynamicRegistration: false,
              resolveProvider: true,
              completionItem: {
                snippetSupport: true,
              },
            },
          },
        },
        progressOnInitialization: true,
        // outputChannel: vscode.window.createOutputChannel('server', 'nativeTwin'),
        documentSelector: LSPConstants.documentSelectors,
        diagnosticCollectionName: LSPConstants.diagnosticProviderSource,
        markdown: { isTrusted: true, supportHtml: true },
        initializationFailedHandler: (error) => {
          console.log('INIT_FAIL: ', error);
          return true;
        },
        workspaceFolder: {
          index: 0,
          name: 'workspace',
          uri: fs.paths.workspaceUri,
        },
      },
    };
    return languageClientConfig;
  });

const createVscodeConfig = () =>
  Effect.gen(function* () {
    const fs = yield* MonacoFs;
    const config: MonacoVscodeApiConfig = {
      $type: 'extended',
      viewsConfig: {
        $type: 'EditorService',
        htmlContainer: document.getElementById('monaco-editor-root')!,
      },
      advanced: {
        enableExtHostWorker: true,
        loadThemes: true,
      },
      extensions: [
        {
          config: {
            name: LSPConstants.vscodeExtensionName,
            publisher: LSPConstants.vscodePublisher,
            version: '1.0.0',
            engines: {
              vscode: '*',
            },
          },
        },
      ],
      logLevel: LogLevel.Debug,
      workspaceConfig: {
        developmentOptions: { logLevel: LogLevel.Debug },
        enableWorkspaceTrust: true,
        workspaceProvider: {
          trusted: true,
          async open() {
            window.open(window.location.href);
            return true;
          },
          workspace: {
            workspaceUri: fs.paths.workspaceFileUri,
            label: 'workspace',
            folderUri: fs.paths.workspaceUri,
          },
        },
      },
      userConfiguration: {
        json: JSON.stringify({
          'workbench.colorTheme': 'Default Dark Modern',
          'editor.wordBasedSuggestions': 'off',
          'typescript.tsserver.web.projectWideIntellisense.enabled': true,
          'typescript.tsserver.web.projectWideIntellisense.suppressSemanticErrors': false,
          'diffEditor.renderSideBySide': false,
          'editor.guides.bracketPairsHorizontal': true,
          'editor.experimental.asyncTokenization': false,
        }),
      },
      monacoWorkerFactory: configureMonacoWorkers,
    };

    return config;
  });

const configureMonacoWorkers = (logger?: Logger) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useWorkerFactory({
    workerLoaders: {
      TextEditorWorker: () => {
        console.debug('LOAD_TEXT_EDITOR WORKER');
        logger?.debug('asdasdasd');
        return new Worker(editorWorker, { type: 'module', name: 'EditorWorker' });
      },
      TextMateWorker: () => {
        console.debug('LOAD_TEXTMATE WORKER');
        return new Worker(textMateWorker, { type: 'module', name: 'TextMateWorker' });
      },
    },
    getWorkerOverride(moduleId, label) {
      switch (label) {
        // case 'json':
        //   return new jsonWorker();
        case 'typescript':
        case 'javascript':
          return new Worker(tsWorker, { type: 'module', name: 'TypescriptWorker' });
        // case 'html':
        //   return new htmlWorker();
        // case 'css':
        //   return new cssWorker();
        case 'TextMateWorker':
          return new Worker(textMateWorker, { type: 'module', name: 'TextMateWorker' });
        case 'editorWorkerService':
        case 'TextEditorWorker':
          return new Worker(editorWorker, { type: 'module', name: 'EditorWorker' });
        default:
          console.warn('OTHER_WORKER_LOAD: ', moduleId, label);
          return new Worker(editorWorker, { type: 'module', name: 'EditorWorker' });
      }
    },
    logger,
  });
};
