import { Option } from 'effect';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { ConfigManager, ConfigManagerService } from './connection/client.config';
import { initializeConnection } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService, DocumentsServiceLive } from './documents/documents.service';
import * as LanguageService from './language/language.service';
import {
  NativeTwinManager,
  NativeTwinManagerService,
} from './native-twin/native-twin.models';
// import { LoggerLive } from './services/logger.service';
// import { TypescriptService } from './services/typescript.service';
import { DEFAULT_PLUGIN_CONFIG } from './utils/constants.utils';

// const ProgramLive = ConnectionNeededLayers.pipe(Layer.provide(TypescriptService.Live));
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const program = Effect.gen(function* ($) {
  const { Connection } = yield* $(ConnectionService);
  // const documentsService = yield* $(DocumentsService);
  const twinLayer = Layer.succeed(NativeTwinManagerService, new NativeTwinManager());
  const configLayer = Layer.succeed(
    ConfigManagerService,
    new ConfigManager({
      config: DEFAULT_PLUGIN_CONFIG,
      tsconfig: Option.none(),
      twinConfigFile: Option.none(),
      workspaceRoot: Option.none(),
    }),
  );
  // const documentLayer = Layer.succeed(DocumentsService, DocumentsServiceLive);
  const twinManagerRuntime = ManagedRuntime.make(
    twinLayer
      .pipe(Layer.provideMerge(DocumentsServiceLive))
      .pipe(Layer.provideMerge(configLayer)),
  );

  Connection.onInitialize((...args) => {
    return twinManagerRuntime.runSync(initializeConnection(...args));
  });

  Connection.onCompletion((...args) => {
    const completions = twinManagerRuntime.runSync(
      LanguageService.getCompletionsAtPosition(...args),
    );

    return {
      isIncomplete: true,
      items: completions,
      itemDefaults: {},
    };
  });

  Connection.onDocumentHighlight((params) => {
    Connection.console.info('onDocumentHighlight: ' + JSON.stringify(params, null, 2));
    return undefined;
  });

  Connection.onColorPresentation((_params) => {
    // Connection.console.info('onColorPresentation: ' + JSON.stringify(params, null, 2));
    return undefined;
  });

  Connection.onDocumentColor((_params) => {
    // Connection.console.info('onDocumentColor: ' + JSON.stringify(params, null, 2));
    return undefined;
  });

  Connection.onRequest('executeSleep', async (params, token) => {
    // Listen for a cancellation request from the language client.
    token.onCancellationRequested(async () => {
      Connection.console.log('Cancellation requested');
    });

    await sleep(10000);
  });

  Connection.onCompletionResolve((...args) => {
    return twinManagerRuntime.runSync(LanguageService.getCompletionEntryDetails(...args));
  });

  Connection.onHover((...args) => {
    return twinManagerRuntime.runSync(LanguageService.getQuickInfoAtPosition(...args));
  });

  Connection.listen();
  twinManagerRuntime.runFork(
    Effect.gen(function* () {
      const documentsService = yield* DocumentsService;
      documentsService.handler.listen(Connection);
    }),
  );
});

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
