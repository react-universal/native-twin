import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { ConfigManagerService } from './connection/client.config';
import { initializeConnection } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService, DocumentsServiceLive } from './documents/documents.service';
import * as LanguageService from './language/language.service';
import { NativeTwinManagerService } from './native-twin/native-twin.models';
import { runWithTokenDefault } from './utils/effect.utils';

const MainLive = Layer.mergeAll(
  ConnectionService.Live,
  DocumentsServiceLive,
  NativeTwinManagerService.Live,
).pipe(Layer.provideMerge(ConfigManagerService.Live));

const program = Effect.gen(function* () {
  const connectionService = yield* ConnectionService;
  const Connection = connectionService;
  const configService = yield* ConfigManagerService;
  const documentService = yield* DocumentsService;
  const nativeTwinManager = yield* NativeTwinManagerService;

  const localContext = Context.empty().pipe(
    Context.add(ConfigManagerService, configService),
    Context.add(DocumentsService, documentService),
    Context.add(NativeTwinManagerService, nativeTwinManager),
    Context.add(ConnectionService, connectionService),
  );

  Connection.onInitialize(async (...args) => {
    return runWithTokenDefault(
      initializeConnection(...args).pipe(Effect.provide(localContext)),
      args[1],
    ).then((x) => x ?? { capabilities: {} });
  });

  Connection.onCompletion(async (...args) => {
    const completions = await runWithTokenDefault(
      LanguageService.getCompletionsAtPosition(...args).pipe(
        Effect.provide(localContext),
      ),
      args[1],
    );

    if (!completions) return undefined;

    return {
      isIncomplete: true,
      items: completions.entries,
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

  Connection.onCompletionResolve(async (...args) => {
    return runWithTokenDefault(
      LanguageService.getCompletionEntryDetails(...args).pipe(
        Effect.provide(localContext),
      ),
      args[1],
    ).then((x) => x ?? args[0]);
  });

  Connection.onHover((...args) => {
    return runWithTokenDefault(
      LanguageService.getQuickInfoAtPosition(...args).pipe(Effect.provide(localContext)),
      args[1],
    );
  });

  Connection.listen();
  documentService.handler.listen(Connection);
});
// .pipe(Effect.provide(LoggerLive))
// .pipe(Logger.withMinimumLogLevel(LogLevel.All));

const runnable = Effect.provide(program, MainLive);

Effect.runFork(runnable);
