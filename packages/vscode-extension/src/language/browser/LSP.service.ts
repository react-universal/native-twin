import * as vscode from 'vscode';
import { LSPConfig, LSPConstants } from '@native-twin/language-service';
import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import { LanguageClient, type LanguageClientOptions } from 'vscode-languageclient/browser';
import { VscodeContext } from '../../extension/extension.service';
import { extensionConfigValue, registerCommand } from '../../extension/extension.utils';
import {
  createFileWatchers,
  getColorDecoration,
  getConfigFiles,
  getDefaultLanguageClientOptions,
  onLanguageClientClosed,
  onLanguageClientError,
  onProvideDocumentColors,
} from '../common/language.utils';

const make = Effect.gen(function* () {
  const extensionCtx = yield* VscodeContext;
  const workspace = vscode.workspace.workspaceFolders;
  const { config } = yield* LSPConfig;
  const currentConfig = yield* config.get;

  const fileEvents = yield* createFileWatchers;

  const configFiles = yield* getConfigFiles;
  const colorDecorationType = yield* getColorDecoration;
  extensionCtx.subscriptions.push(colorDecorationType);

  const clientConfig: LanguageClientOptions = {
    ...getDefaultLanguageClientOptions({
      ...currentConfig,
      twinConfigPath: configFiles.at(0)?.path ?? currentConfig.twinConfigPath,
      rootDir: workspace?.at(0)?.uri.path ?? currentConfig.rootDir,
    }),
    synchronize: {
      fileEvents: fileEvents,
      configurationSection: LSPConstants.vscodeConfigSection,
    },
    errorHandler: {
      error: onLanguageClientError,
      closed: onLanguageClientClosed,
    },
    middleware: {
      provideDocumentColors: async (document, token, next) =>
        onProvideDocumentColors(document, token, next, colorDecorationType),
    },
  };

  const client = yield* Effect.acquireRelease(
    Effect.sync(
      () =>
        new LanguageClient(
          'native-twin-vscode',
          LSPConstants.extensionServerChannelName,
          clientConfig,
          new Worker(
            vscode.Uri.joinPath(extensionCtx.extensionUri, 'twin.worker.js').toString(true),
          ),
        ),
    ),
    (x) =>
      Effect.promise(() => x.dispose()).pipe(
        Effect.flatMap(() => Effect.logDebug('Language Client Disposed')),
      ),
  );

  yield* Effect.promise(() => client.start()).pipe(
    Effect.andThen(Effect.logTrace('Language client started!')),
  );

  client.onRequest('nativeTwinInitialized', () => {
    return { t: true };
  });

  yield* registerCommand(`${LSPConstants.vscodeConfigSection}.restart`, () =>
    Effect.gen(function* () {
      yield* Effect.promise(() => client.stop());
      yield* Effect.promise(() => client.start());
      yield* Effect.logInfo('Client restarted');
    }),
  );

  const functionsConfig = yield* extensionConfigValue(
    'functions',
    LSPConstants.lspRawConfig.functions,
  );
  const debugConfig = yield* extensionConfigValue('debug', LSPConstants.lspRawConfig.debug);

  yield* functionsConfig.changes.pipe(
    Stream.runForEach((x) => Effect.log('FUNCTIONS: ', x)),
    Effect.fork,
  );
  yield* debugConfig.changes.pipe(
    Stream.runForEach((x) => Effect.log('DEBUG: ', x)),
    Effect.fork,
  );

  return client;
});

export class LanguageClientContextBrowser extends Ctx.Tag('vscode/LanguageClientContext')<
  LanguageClientContextBrowser,
  LanguageClient
>() {
  static Live = Layer.scoped(LanguageClientContextBrowser, make);
}
