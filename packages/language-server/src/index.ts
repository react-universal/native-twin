import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import { getClientCapabilities, languagePrograms } from '@native-twin/language-service';
import { vscodeLSPAdapterExecutor } from '@native-twin/language-service/adapters/vscode.adapter.js';
import {
  classNameCompletions,
  LSPConfig,
  LSPContext,
  twinCompletionsToVscode,
} from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { LspMainLive } from './services/LSP.service';

const Runtime = ManagedRuntime.make(Layer.suspend(() => LspMainLive));

const program = Effect.gen(function* () {
  const { connection: Connection, documents } = yield* LSPContext;
  const config = yield* LSPConfig;
  // const program = yield* TypescriptApi.TypeScriptProgram;

  // const root = currentConfig.workspaceRoot.pipe(Option.getOrElse(() => process.cwd()));
  // const languageService = createTsAPI([root], ts.getDefaultCompilerOptions());

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);

    const configOptions = params.initializationOptions;
    await Runtime.runPromise(config.onChangeConfig(configOptions));

    return capabilities;
  });

  Connection.onDidChangeConfiguration(async (changes) => {
    await Effect.runPromise(config.onChangeConfig(changes.settings));
  });

  Connection.onCompletion(async (params) => {
    const items = await classNameCompletions
      .apply(params.textDocument.uri, params.position, vscodeLSPAdapterExecutor)
      .pipe(
        Effect.andThen((result) =>
          vscodeLSPAdapterExecutor
            .getLSPDocument(params.textDocument.uri)
            .pipe(
              Effect.andThen((document) =>
                twinCompletionsToVscode(
                  result.region,
                  document.document,
                  document.document.offsetAt(params.position),
                ),
              ),
            ),
        ),
        Runtime.runPromise,
      );

    return {
      isIncomplete: true,
      items: items,
    };
  });

  Connection.onCompletionResolve(
    async (...args) =>
      // languagePrograms.getCompletionEntryDetails(...args).pipe(Runtime.runPromise),
      args[0],
  );

  Connection.onHover(
    async (..._args) =>
      // languagePrograms.getHoverDetails(...args).pipe(Runtime.runPromise),
      undefined,
  );

  Connection.languages.diagnostics.on(async (..._args) =>
    // languagePrograms.getDocumentDiagnosticsProgram(...args).pipe(Runtime.runPromise),
    ({
      kind: 'full',
      items: [],
    }),
  );

  Connection.onDocumentColor(
    async (..._params) => [],
    // languagePrograms.getDocumentColors(...params).pipe(Runtime.runPromise),
  );

  Connection.onDocumentHighlight(async (...args) => {
    const data = await languagePrograms
      .getDocumentHighLightsProgram(...args)
      .pipe(Runtime.runPromise);
    return data;
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
