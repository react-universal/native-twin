import * as vscode from 'vscode';
import { LSPConfig, LSPConstants } from '@native-twin/language-service/browser';
import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import { LanguageClient, type LanguageClientOptions } from 'vscode-languageclient/browser';
import { VscodeContext } from '../../extension/extension.service';
import { extensionConfigValue, registerCommand } from '../../extension/extension.utils';
import {
  getDefaultLanguageClientOptions,
  onLanguageClientClosed,
  onLanguageClientError,
} from '../common/language.utils';

const make = Effect.gen(function* () {
  const extensionCtx = yield* VscodeContext;
  const { config } = yield* LSPConfig;
  const currentConfig = yield* config.get;

  const createWorker = () => {
    const workerPath = vscode.Uri.joinPath(
      extensionCtx.extensionUri,
      'build/cjs/twin.worker.js',
    ).toString(true);
    const worker = new Worker(workerPath, {
      credentials: 'omit',
      name: 'twin.worker',
      type: 'classic',
    });
    worker.addEventListener('message', (event) => {
      console.log('WORKER_TALKING: ', event);
    });
    return worker;
  };

  // const colorDecorationType = yield* getColorDecoration;
  // extensionCtx.subscriptions.push(colorDecorationType);

  let counter = 0;
  const clientConfig: LanguageClientOptions = {
    ...getDefaultLanguageClientOptions(currentConfig),

    synchronize: {
      // fileEvents: fileEvents,
      configurationSection: LSPConstants.vscodeConfigSection,
    },
    initializationFailedHandler: (error) => {
      console.log('INIT_ERROR: ', error);
      return ++counter < 3;
    },
    errorHandler: {
      error: onLanguageClientError,
      closed: onLanguageClientClosed,
    },
    // middleware: {
    //   provideDocumentColors: async (document, token, next) =>
    //     onProvideDocumentColors(document, token, next, colorDecorationType),
    // },
  };
  const client = yield* Effect.sync(
    () =>
      new LanguageClient(
        LSPConstants.extensionChannelName,
        LSPConstants.vscodeExtensionName,
        clientConfig,
        createWorker(),
      ),
  );
  console.log(
    'CLIENT: ',
    client.onDidChangeState((state) => {
      console.log('STATE_CHANGE: ', state);
    }),
  );
  console.log('OPTIONS: ', client.clientOptions);

  yield* Effect.tryPromise(() => client.start()).pipe(
    Effect.andThen(Effect.logTrace('Language client started!')),
  );

  // client.onRequest('nativeTwinInitialized', () => {
  //   return { t: true };
  // });

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
  static Live = Layer.effect(LanguageClientContextBrowser, make);
}
