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
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const program = Effect.gen(function* ($) {
  const { Connection } = yield* $(ConnectionService);
  const documentsService = yield* $(DocumentsService);
  const twinLayer = Layer.succeed(NativeTwinManagerService, new NativeTwinManager());
  const documentLayer = Layer.succeed(DocumentsService, documentsService);
  const twinManagerRuntime = ManagedRuntime.make(
    twinLayer.pipe(Layer.provideMerge(documentLayer)),
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
  documentsService.handler.listen(Connection);
}).pipe(Effect.provide(ProgramLive));

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
