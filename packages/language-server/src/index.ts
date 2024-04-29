import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { initializeConnection } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService, DocumentsServiceLive } from './documents/documents.service';
import * as LanguageService from './language/language.service';
import {
  NativeTwinManager,
  NativeTwinManagerService,
} from './native-twin/native-twin.models';
import { LoggerLive } from './services/logger.service';
import { TypescriptService } from './services/typescript.service';

const ConnectionNeededLayers = DocumentsServiceLive.pipe(Layer.provide(LoggerLive));

const ProgramLive = ConnectionNeededLayers.pipe(Layer.provide(TypescriptService.Live));

const program = Effect.gen(function* ($) {
  const { Connection } = yield* $(ConnectionService);
  const documentsService = yield* $(DocumentsService);
  const twinLayer = Layer.succeed(NativeTwinManagerService, new NativeTwinManager());
  const twinManagerRuntime = ManagedRuntime.make(twinLayer);

  Connection.onInitialize((...args) => {
    return twinManagerRuntime.runSync(initializeConnection(...args));
  });

  Connection.onCompletion((...args) => {
    const completions = twinManagerRuntime.runSync(
      LanguageService.getCompletionsAtPosition(...args).pipe(
        Effect.provideService(DocumentsService, documentsService),
      ),
    );

    return {
      isIncomplete: true,
      items: completions,
      itemDefaults: {},
    };
  });

  Connection.onCompletionResolve(async (...args) => {
    return twinManagerRuntime.runSync(
      LanguageService.getCompletionEntryDetails(...args).pipe(
        Effect.provideService(DocumentsService, documentsService),
      ),
    );
  });

  Connection.onHover((...args) => {
    return twinManagerRuntime.runSync(
      LanguageService.getQuickInfoAtPosition(...args).pipe(
        Effect.provideService(DocumentsService, documentsService),
      ),
    );
  });

  Connection.listen();
  documentsService.handler.listen(Connection);
}).pipe(Effect.provide(ProgramLive));

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
