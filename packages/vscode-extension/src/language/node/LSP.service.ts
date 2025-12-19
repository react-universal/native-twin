import * as vscode from 'vscode';
import { LSPConfig, LSPConstants } from '@native-twin/language-service';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as path from 'path';
import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import { VscodeContext } from '../../extension/extension.service';
import { registerCommand } from '../../extension/extension.utils';
import {
  createFileWatchers,
  getColorDecoration,
  getDefaultLanguageClientOptions,
  onLanguageClientClosed,
  onLanguageClientError,
  onProvideDocumentColors,
} from '../common/language.utils';

export const LanguageClientLive = Effect.gen(function* () {
  // const twin = yield* NativeTwinManagerService;
  const extensionCtx = yield* VscodeContext;
  const lspConfig = yield* LSPConfig;

  yield* createFileWatchers;
  // yield* activateTwinTsPlugin;

  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
  const diagnostic = vscode.languages.createDiagnosticCollection(
    LSPConstants.diagnosticProviderSource,
  );

  extensionCtx.subscriptions.push(diagnostic);

  const serverModule = extensionCtx.asAbsolutePath(
    path.join('build', 'cjs', 'servers', 'lsp.node.js'),
  );
  const serverConfig: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
  };

  const fileEvents = yield* createFileWatchers;

  // const configFiles = yield* getConfigFiles;
  const colorDecorationType = yield* getColorDecoration;
  extensionCtx.subscriptions.push(colorDecorationType);
  const serverLogger = vscode.window.createOutputChannel(LSPConstants.extensionServerChannelName, {
    log: true,
  });

  const currentConfig = yield* lspConfig.config.get;
  const clientConfig: LanguageClientOptions = {
    ...getDefaultLanguageClientOptions(currentConfig),
    synchronize: {
      fileEvents: fileEvents,
      configurationSection: LSPConstants.vscodeConfigSection,
    },
    errorHandler: {
      error: onLanguageClientError,
      closed: onLanguageClientClosed,
    },
    diagnosticCollectionName: diagnostic.name,
    outputChannel: serverLogger,
    middleware: {
      workspace: {
        workspaceFolders: (token, next) => {
          return next(token);
        },
      },
      handleDiagnostics(uri, diagnostics, next) {
        diagnostic.set(uri, diagnostics);
        return next(uri, diagnostics);
      },
      provideDocumentColors: async (document, token, next) => {
        return onProvideDocumentColors(document, token, next, colorDecorationType);
      },
    },
  };
  const languageClient = yield* Effect.acquireRelease(
    Effect.sync(
      () =>
        new LanguageClient(
          LSPConstants.vscodeConfigSection,
          LSPConstants.extensionServerChannelName,
          serverConfig,
          clientConfig,
        ),
    ),
    (x) =>
      Effect.promise(() => x.dispose()).pipe(
        Effect.flatMap(() => Effect.logDebug('Language Client Disposed')),
      ),
  );

  yield* Effect.promise(() => languageClient.start()).pipe(
    Effect.andThen(Effect.log('Language client started!')),
  );

  yield* registerCommand(`${LSPConstants.vscodeConfigSection}.restart`, () =>
    Effect.gen(function* () {
      yield* Effect.promise(() => languageClient.restart());
      yield* Effect.log('Client restarted');
    }),
  );
}).pipe(
  Effect.withLogSpan('LanguageServiceClient'),
  Effect.onError((error) => Effect.logError('ERROR: ', Cause.prettyErrors(error))),
  Layer.scopedDiscard,
);
