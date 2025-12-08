import * as vscode from 'vscode';
import * as path from 'node:path';
import { LSPConfig, LSPConstants } from '@native-twin/language-service';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
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

  const serverConfig: ServerOptions = {
    run: {
      module: extensionCtx.asAbsolutePath(path.join('build', 'cjs', 'servers', 'lsp.node.js')),
      transport: TransportKind.ipc,
    },
    debug: {
      module: extensionCtx.asAbsolutePath(path.join('build', 'cjs', 'servers', 'lsp.node.js')),
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const fileEvents = yield* createFileWatchers;

  // const configFiles = yield* getConfigFiles;
  const colorDecorationType = yield* getColorDecoration;
  extensionCtx.subscriptions.push(colorDecorationType);

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
    diagnosticCollectionName: LSPConstants.diagnosticProviderSource,
    outputChannel: vscode.window.createOutputChannel(LSPConstants.extensionServerChannelName, {
      log: true,
    }),
    middleware: {
      workspace: {
        workspaceFolders: (token, next) => {
          return next(token);
        },
      },
      // provideCompletionItem: async (document, position, context, token, next) => {
      //   const completions = await next(document, position, context, token);
      //   return completions;
      // },
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
