import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver-types';
import { getClientCapabilities } from './connection/connection.handlers';
import { ConnectionService } from './connection/connection.service';
import { DocumentsServiceLive } from './documents/documents.service';
import { LanguageService, LanguageServiceLive } from './language/language.service';
import {
  NativeTwinServiceLive,
  NativeTwinService,
} from './native-twin/nativeTwin.service';
import { LoggerLive } from './services/logger.service';
import { TypescriptService } from './services/typescript.service';

const MainLive = LanguageServiceLive.pipe(
  Layer.provideMerge(NativeTwinServiceLive),
  Layer.provide(DocumentsServiceLive),
  Layer.provide(TypescriptService.Live),
  Layer.provide(LoggerLive),
);

const program = Effect.gen(function* ($) {
  const connectionRef = yield* $(ConnectionService);
  const twin = yield* $(NativeTwinService);
  const connection = yield* $(connectionRef.connectionRef.get);
  const language = yield* $(LanguageService);

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
    return language.onComPletion(params, token, pr, rp).pipe(Effect.runSync);
  });
  connection.onCompletionResolve((params, token) => {
    return language.onCompletionResolve(params, token).pipe(Effect.runSync);
  });
  connection.onHover((params, token, workDoneProgress, resultProgress) => {
    return language
      .onHover(params, token, workDoneProgress, resultProgress)
      .pipe(Effect.runSync)
      .pipe(Option.getOrUndefined);
  });

  connection.listen();
}).pipe(Effect.provide(MainLive));

const runnable = Effect.provide(program, ConnectionService.Live);

Effect.runFork(runnable);
