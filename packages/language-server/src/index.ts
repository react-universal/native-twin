import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { ConfigManagerService } from './connection/client.config';
import { initializeConnection } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService, DocumentsServiceLive } from './documents/documents.service';
import * as LanguageService from './language/language.service';
import { NativeTwinManagerService } from './native-twin/native-twin.models';
import { sendDebugLog } from './services/logger.service';

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

  const localLayer = Layer.succeedContext(localContext);

  const runtime = ManagedRuntime.make(localLayer);

  Connection.onInitialize(async (...args) => {
    return runtime.runPromise(initializeConnection(...args));
  });

  Connection.onCompletion(async (...args) => {
    const completions = await runtime.runPromise(
      LanguageService.getCompletionsAtPosition(...args),
    );

    return {
      isIncomplete: true,
      items: completions,
    };
  });

  Connection.onCompletionResolve(async (...args) => {
    return runtime.runPromise(
      LanguageService.getCompletionEntryDetails(...args).pipe(
        Effect.tap((x) => sendDebugLog('CompletionItems', x)),
      ),
    );
  });

  Connection.onHover((...args) => {
    return runtime.runPromise(LanguageService.getQuickInfoAtPosition(...args));
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

  Connection.listen();
  documentService.handler.listen(Connection);
});

const runnable = Effect.provide(program, MainLive);

Effect.runFork(runnable);
