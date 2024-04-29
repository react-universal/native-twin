import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { getClientCapabilities } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService, DocumentsServiceLive } from './documents/documents.service';
import * as LanguageService from './language/language.service';
import {
  NativeTwinManager,
  NativeTwinManagerService,
} from './native-twin/native-twin.models';
import { LoggerLive } from './services/logger.service';
import { TypescriptService } from './services/typescript.service';

const ConnectionNeededLayers = LanguageService.LanguageServiceLive.pipe(
  Layer.provideMerge(DocumentsServiceLive),
).pipe(Layer.provide(LoggerLive));

const ProgramLive = ConnectionNeededLayers.pipe(Layer.provide(TypescriptService.Live));

const program = Effect.gen(function* ($) {
  const { Connection } = yield* $(ConnectionService);
  const documentsService = yield* $(DocumentsService);
  const languageService = yield* $(LanguageService.LanguageService);
  const twinLayer = Layer.succeed(NativeTwinManagerService, new NativeTwinManager());
  const twinManagerRuntime = ManagedRuntime.make(twinLayer);

  Connection.onInitialize((params) => {
    return twinManagerRuntime.runSync(
      Effect.gen(function* () {
        const manager = yield* NativeTwinManagerService;

        const configOptions = params.initializationOptions;

        if (configOptions) {
          const twinConfigFile = Option.fromNullable<vscode.URI>(
            configOptions?.twinConfigFile.path,
          );
          manager.loadUserFile(
            Option.map(twinConfigFile, (a) => {
              console.log('asd,', a);
              return a;
            }).pipe(Option.getOrElse(() => '')),
          );
        }

        const capabilities = yield* getClientCapabilities(params.capabilities);

        return capabilities;
      }),
    );
  });

  Connection.onCompletion((params, token, pr, rp) => {
    const completions = twinManagerRuntime.runSync(
      languageService.getCompletionsAtPosition(params, token, pr, rp),
    );

    return {
      isIncomplete: true,
      items: completions,
      itemDefaults: {},
    };
  });
  Connection.onCompletionResolve(async (params, token) => {
    return twinManagerRuntime.runSync(
      languageService.getCompletionEntryDetails(params, token),
    );
  });
  Connection.onHover((...args) => {
    return twinManagerRuntime.runSync(languageService.getQuickInfoAtPosition(...args));
  });

  Connection.listen();
  documentsService.handler.listen(Connection);
}).pipe(Effect.provide(ProgramLive));

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
