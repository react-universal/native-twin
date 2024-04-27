import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Runtime from 'effect/Runtime';
import * as vscode from 'vscode-languageserver-types';
import { CancellationToken } from 'vscode-languageserver/node';
import { getClientCapabilities } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsService, DocumentsServiceLive } from './documents/documents.service';
import * as LanguageService from './language/language.service';
import {
  NativeTwinServiceLive,
  NativeTwinService,
} from './native-twin/nativeTwin.service';
import { LoggerLive } from './services/logger.service';
import { TypescriptService } from './services/typescript.service';

const ConnectionNeededLayers = Layer.merge(
  DocumentsServiceLive,
  NativeTwinServiceLive,
).pipe(Layer.provideMerge(LoggerLive));

const ProgramLive = ConnectionNeededLayers.pipe(Layer.provide(TypescriptService.Live));

const program = Effect.gen(function* ($) {
  const connectionRef = yield* $(ConnectionService);
  const twin = yield* $(NativeTwinService);
  const documentsService = yield* $(DocumentsService);
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

export const runWithToken = <R>(runtime: Runtime.Runtime<R>) => {
  const runCallback = Runtime.runCallback(runtime);
  return <E, A>(effect: Effect.Effect<A, E, R>, token: CancellationToken) =>
    new Promise<A | undefined>((resolve) => {
      const cancel = runCallback(effect, {
        onExit: (exit) => {
          if (exit._tag === 'Success') {
            resolve(exit.value);
          } else {
            resolve(undefined);
          }
          tokenDispose.dispose();
        },
      });
      const tokenDispose = token.onCancellationRequested(() => {
        cancel();
      });
    });
};
export const runWithTokenDefault = runWithToken(Runtime.defaultRuntime);

export const thenable = <A>(f: () => Thenable<A>) => {
  return Effect.async<A>((resume) => {
    f().then((_) => resume(Effect.succeed(_)));
  });
};
