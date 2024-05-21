import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { ConfigManagerService } from './connection/client.config';
import { initializeConnection } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService } from './documents/documents.service';
import { LanguageServiceLive, createLanguageService } from './language';
import { NativeTwinManagerService } from './native-twin/native-twin.service';
import { sendDebugLog } from './services/logger.service';

const MainLive = Layer.mergeAll(ConnectionService.Live, LanguageServiceLive).pipe(
  Layer.provideMerge(
    Layer.mergeAll(DocumentsService.Live, NativeTwinManagerService.Live),
  ),
  Layer.provideMerge(ConfigManagerService.Live),
);

const program = Effect.gen(function* () {
  const connectionService = yield* ConnectionService;
  const Connection = connectionService;
  const configService = yield* ConfigManagerService;
  const documentService = yield* DocumentsService;
  const nativeTwinManager = yield* NativeTwinManagerService;
  const languageService = yield* createLanguageService;

  Connection.onInitialize(async (...args) =>
    initializeConnection(...args, nativeTwinManager, configService),
  );

  Connection.onCompletion(async (...args) => {
    const completions = await Effect.runPromise(
      languageService.completions.getCompletionsAtPosition(...args),
    );

    return {
      isIncomplete: true,
      items: completions,
    };
  });

  Connection.onCompletionResolve(async (...args) =>
    Effect.runPromise(
      languageService.completions
        .getCompletionEntryDetails(...args)
        .pipe(Effect.tap((x) => sendDebugLog('CompletionItems', x))),
    ),
  );

  Connection.onHover(async (...args) =>
    Effect.runPromise(languageService.documentation.getHover(...args)),
  );

  Connection.onDocumentColor(async (...params) =>
    Effect.runPromise(languageService.documentation.getDocumentColors(...params)),
  );

  Connection.languages.diagnostics.on(async (...args) =>
    Effect.runPromise(languageService.diagnostics.getDocumentDiagnostics(...args)),
  );

  Connection.listen();
  documentService.handler.listen(Connection);
});

const runnable = Effect.provide(program, MainLive);

Effect.runFork(runnable);
