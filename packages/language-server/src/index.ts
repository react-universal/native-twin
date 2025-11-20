import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import {
  getClientCapabilities,
  LSPConfigService,
  LSPConnectionService,
  languagePrograms,
  TwinLSPDocumentContext,
} from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { LspMainLive } from './lsp.layer.js';

const Runtime = ManagedRuntime.make(LspMainLive);

const program = Effect.gen(function* () {
  const Connection = yield* LSPConnectionService;
  const documentService = yield* TwinLSPDocumentContext;
  const config = yield* LSPConfigService;

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);

    const configOptions = params.initializationOptions;
    await Runtime.runPromise(config.onUpdateConfig(configOptions));

    return capabilities;
  });

  Connection.onDidChangeConfiguration(async (changes) => {
    await Effect.runPromise(config.onConfigConnectionChange(changes.settings));
  });

  Connection.onCompletion(async (...args) =>
    languagePrograms
      .getCompletionsAtPosition(...args)
      .pipe(
        Effect.andThen((items) => ({
          isIncomplete: true,
          items,
        })),
      )
      .pipe(Runtime.runPromise),
  );

  Connection.onCompletionResolve(async (...args) =>
    languagePrograms.getCompletionEntryDetails(...args).pipe(Runtime.runPromise),
  );

  Connection.onHover(async (...args) =>
    languagePrograms.getHoverDetails(...args).pipe(Runtime.runPromise),
  );

  Connection.languages.diagnostics.on(async (...args) =>
    languagePrograms.getDocumentDiagnosticsProgram(...args).pipe(Runtime.runPromise),
  );

  Connection.onDocumentColor(async (...params) =>
    languagePrograms.getDocumentColors(...params).pipe(Runtime.runPromise),
  );

  Connection.onDocumentHighlight(async (...args) => {
    const data = await languagePrograms
      .getDocumentHighLightsProgram(...args)
      .pipe(Runtime.runPromise);
    return data;
  });

  Connection.onSelectionRanges(async (params, _token, _, __) => {
    params.positions;
    return [];
  });

  Connection.onCodeAction(async (params, _token, _workDone) => {
    const data = await languagePrograms.twinCodeActionsProgram(params).pipe(Runtime.runPromise);

    return data;
  });

  Connection.onCodeActionResolve(async (params) => {
    // console.log('PARAMS: ', params);
    return {
      ...params,
    };
  });

  Connection.onShutdown(() => {
    Connection.console.log('shootDown');
    Connection.dispose();
  });

  Connection.listen();
  const listener = documentService.handler.listen(Connection);

  Effect.addFinalizer((exit) => {
    Connection.console.debug('Disposing Connection');
    Connection.dispose();
    Connection.console.debug('Disposing Documents Handler');
    listener.dispose();
    Connection.console.debug(`Closing reason: ${exit.toJSON()}`);
    return Effect.void;
  });
}).pipe(Effect.provide(NodeContext.layer));

Runtime.runFork(program);

NodeRuntime.runMain(Runtime.runtimeEffect);
