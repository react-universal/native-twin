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
import { TwinDocumentsProviderLive } from '../../file-system/TextDocuments.service';
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
  // const twinDocs = yield* TwinDocumentsProvider;
  const extensionCtx = yield* VscodeContext;
  const lspConfig = yield* LSPConfig;

  yield* createFileWatchers;
  // yield* activateTwinTsPlugin;

  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
  const diagnostic = vscode.languages.createDiagnosticCollection(
    LSPConstants.diagnosticProviderSource,
  );

  const virtualDocumentContents = new Map<string, string>();

  const documentsProvider = vscode.workspace.registerTextDocumentContentProvider(
    'embedded-content',
    {
      provideTextDocumentContent: (uri) => {
        const extension = path.extname(uri.path);
        const originalUri = uri.fsPath.replace(`.${extension}`, '');
        return virtualDocumentContents.get(decodeURIComponent(originalUri));
      },
    },
  );

  const serverModule = extensionCtx.asAbsolutePath(path.join('build', 'servers', 'lsp.node.cjs'));
  const serverConfig: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
  };

  const fileEvents = yield* createFileWatchers;

  const colorDecorationType = yield* getColorDecoration;

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
    documentSelector: LSPConstants.documentSelectors,
    errorHandler: {
      error: onLanguageClientError,
      closed: onLanguageClientClosed,
    },
    diagnosticCollectionName: diagnostic.name,
    outputChannel: serverLogger,
    middleware: {
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

  extensionCtx.subscriptions.push(
    languageClient,
    diagnostic,
    fileEvents,
    colorDecorationType,
    documentsProvider,
  );
}).pipe(
  Effect.withLogSpan('LanguageServiceClient'),
  Effect.onError((error) => Effect.logError('ERROR: ', Cause.prettyErrors(error))),
  Layer.scopedDiscard,
  Layer.provide(TwinDocumentsProviderLive),
);
