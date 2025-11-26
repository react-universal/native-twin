import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import { getClientCapabilities, languagePrograms } from '@native-twin/language-service';
import { LSPConfig, LSPContext } from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import type { CompletionList } from 'vscode-languageserver-types';
import { LspMainLive } from './services/LSP.service';

const Runtime = ManagedRuntime.make(Layer.suspend(() => LspMainLive));

const program = Effect.gen(function* () {
  const { connection: Connection, documents } = yield* LSPContext;
  const config = yield* LSPConfig;

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);
    const configOptions = params.initializationOptions;

    await Runtime.runPromise(config.onChangeConfig(configOptions));

    return capabilities;
  });

  Connection.onDidChangeConfiguration(async (changes) => {
    await Effect.runPromise(config.onChangeConfig(changes.settings));
  });

  Connection.onCompletion(async (params) =>
    languagePrograms.getCompletionsAtPosition.apply(params.textDocument.uri, params.position).pipe(
      Effect.map((comp): CompletionList => ({ items: comp.completions, isIncomplete: true })),
      Runtime.runPromise,
    ),
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

  Connection.onDocumentHighlight(async (..._args) => {
    // const data = await languagePrograms
    //   .getDocumentHighLightsProgram(...args)
    //   .pipe(Runtime.runPromise);
    // return data;
    return null;
  });

  Connection.onSelectionRanges(async (_params, _token, _, __) => {
    return [];
  });

  Connection.onCodeAction(async (_params, _token, _workDone) => {
    // const data = await languagePrograms.twinCodeActionsProgram(params).pipe(Runtime.runPromise);

    // return data;
    return [];
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
  const listener = documents.listen(Connection);

  Effect.addFinalizer((exit) => {
    Connection.console.debug('Disposing Connection');
    Connection.dispose();
    Connection.console.debug('Disposing Documents Handler');
    listener.dispose();
    Connection.console.debug(`Closing reason: ${exit.toJSON()}`);
    return Effect.void;
  });
}).pipe(
  Effect.provide(NodeContext.layer),
  Effect.catchAll((error) => Effect.log(`Language server failed: ${error}`)),
);

Runtime.runFork(program);

NodeRuntime.runMain(Runtime.runtimeEffect);
