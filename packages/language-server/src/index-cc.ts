import { LogLevel, Logger, Option } from 'effect';
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
import { LoggerLive } from './services/logger.service';
// import { TypescriptService } from './services/typescript.service';
import { DEFAULT_PLUGIN_CONFIG } from './utils/constants.utils';

const program = Effect.gen(function* ($) {
  const connectionService = yield* $(ConnectionService);
  const Connection = connectionService;
  const configLayer = Layer.succeed(
    ConfigManagerService,
    new ConfigManager({
      config: DEFAULT_PLUGIN_CONFIG,
      tsconfig: Option.none(),
      twinConfigFile: Option.none(),
      workspaceRoot: Option.none(),
    }),
  );

  const connectionLayer = Layer.succeed(ConnectionService, connectionService);
  const loggerLayer = LoggerLive.pipe(Layer.provideMerge(connectionLayer));
  const twinLayer = Layer.succeed(NativeTwinManagerService, new NativeTwinManager())
    .pipe(Layer.provideMerge(DocumentsServiceLive))
    .pipe(Layer.provideMerge(configLayer))
    .pipe(Layer.provide(loggerLayer));
  const twinManagerRuntime = ManagedRuntime.make(twinLayer);

  Connection.onInitialize(async (...args) => {
    return twinManagerRuntime.runSync(
      initializeConnection(...args).pipe(Effect.provide(loggerLayer)),
    );
  });

  Connection.onCompletion((...args) => {
    const completions = twinManagerRuntime.runSync(
      LanguageService.getCompletionsAtPosition(...args),
    );

    if (!completions) return undefined;

    return {
      isIncomplete: true,
      items: completions,
      itemDefaults: {},
    };
  });

  Connection.onDocumentHighlight((_params) => {
    // Connection.console.info('onDocumentHighlight: ' + JSON.stringify(params, null, 2));
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
})
  .pipe(Effect.provide(LoggerLive))
  .pipe(Logger.withMinimumLogLevel(LogLevel.All));

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
