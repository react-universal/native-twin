import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import * as vscode from 'vscode-languageserver-types';
import { getClientCapabilities } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService, DocumentsServiceLive } from './documents/documents.service';
import * as LanguageService from './language/language.service';
import {
  NativeTwinServiceLive,
  NativeTwinService,
} from './native-twin/native-twin.service';
import { LoggerLive } from './services/logger.service';
import { TypescriptService } from './services/typescript.service';

const ConnectionNeededLayers = Layer.fresh(LanguageService.LanguageServiceLive)
  .pipe(Layer.provideMerge(Layer.merge(DocumentsServiceLive, NativeTwinServiceLive)))
  .pipe(Layer.provide(LoggerLive));

const ProgramLive = ConnectionNeededLayers.pipe(Layer.provide(TypescriptService.Live));

const program = Effect.gen(function* ($) {
  const { Connection, ClientConfig } = yield* $(ConnectionService);
  const documentsService = yield* $(DocumentsService);
  const twin = yield* $(NativeTwinService);
  const languageService = yield* $(LanguageService.LanguageService);

  Connection.onInitialize((params) => {
    const configOptions = params.initializationOptions;

    if (configOptions) {
      const configFiles = {
        ...configOptions,
        tsconfig: Option.fromNullable<vscode.URI>(configOptions?.tsconfigFiles?.[0]),
        twinConfigFile: Option.fromNullable<vscode.URI>(configOptions?.twinConfigFile),
        workspaceRoot: Option.fromNullable<vscode.WorkspaceFolder>(
          configOptions?.workspaceRoot,
        ),
      };

      SubscriptionRef.update(ClientConfig, () => configOptions).pipe(Effect.runFork);
      twin.onUpdateConfig(configFiles);
    }

    const capabilities = getClientCapabilities(params.capabilities).pipe(Effect.runSync);

    return capabilities;
  });

  Connection.onCompletion((params, token, pr, rp) => {
    const completions = languageService
      .getCompletionsAtPosition(params, token, pr, rp)
      .pipe(Effect.runSync);

      return {
        isIncomplete: true,
        items: completions,
        itemDefaults: {},
      }
  });
  Connection.onCompletionResolve(async (params, token) => {
    return languageService.getCompletionEntryDetails(params, token).pipe(Effect.runSync);
  });
  Connection.onHover((...args) => {
    return languageService.getQuickInfoAtPosition(...args).pipe(Effect.runSync);
  });

  Connection.listen();
  documentsService.handler.listen(Connection);
}).pipe(Effect.provide(ProgramLive));

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
