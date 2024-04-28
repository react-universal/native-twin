import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
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
import { runWithTokenDefault } from './utils/effect.utils';

const ConnectionNeededLayers = Layer.merge(
  DocumentsServiceLive,
  NativeTwinServiceLive,
).pipe(Layer.provideMerge(LoggerLive));

const ProgramLive = ConnectionNeededLayers.pipe(Layer.provide(TypescriptService.Live));

const program = Effect.gen(function* ($) {
  const connectionRef = yield* $(ConnectionService);
  const documentsService = yield* $(DocumentsService);
  const twin = yield* $(NativeTwinService);
  const connection = yield* $(connectionRef.connectionRef.get);

  connection.onInitialize((params) => {
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
      connectionRef.clientConfigRef.set(configFiles).pipe(Effect.runSync);
      twin.onUpdateConfig(configFiles);
    }

    const capabilities = getClientCapabilities(params.capabilities).pipe(Effect.runSync);

    return capabilities;
  });

  connection.onCompletion((params, token, pr, rp) => {
    return runWithTokenDefault(
      LanguageService.getCompletionsAtPosition(params, token, pr, rp).pipe(
        Effect.provideService(NativeTwinService, twin),
        Effect.provideService(DocumentsService, documentsService),
      ),
      token,
    );
  });
  connection.onCompletionResolve(async (params, token) => {
    const response = await runWithTokenDefault(
      LanguageService.getCompletionEntryDetails(params, token).pipe(
        Effect.provideService(NativeTwinService, twin),
        Effect.provideService(DocumentsService, documentsService),
      ),
      token,
    );
    if (!response) return params;

    return response;
  });
  connection.onHover((...args) => {
    return runWithTokenDefault(
      LanguageService.getQuickInfoAtPosition(...args).pipe(
        Effect.provideService(NativeTwinService, twin),
        Effect.provideService(DocumentsService, documentsService),
      ),
      args[1],
    );
  });

  connection.listen();
}).pipe(Effect.provide(ProgramLive));

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
