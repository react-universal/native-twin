import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import { getClientCapabilities, twinCompletionsToVscode } from '@native-twin/language-service';
import { vscodeLSPAdapterExecutor } from '@native-twin/language-service/adapters/vscode.adapter.js';
import {
  classNameCompletions,
  LSPConfig,
  LSPContext,
} from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { CompletionList } from 'vscode-languageserver-types';
import { LspMainLive } from './services/LSP.service';
import { LoggerLive } from './services/logger.service';

const Runtime = ManagedRuntime.make(Layer.suspend(() => LspMainLive));

const program = Effect.gen(function* () {
  const { connection: Connection, documents } = yield* LSPContext;
  const config = yield* LSPConfig;

  const fetchDocument = (uri: string) => vscodeLSPAdapterExecutor.getLSPDocument(uri);

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
    const regions = await classNameCompletions
      .apply(params.textDocument.uri, params.position, vscodeLSPAdapterExecutor)
      .pipe(Runtime.runPromise);

    const items = await fetchDocument(params.textDocument.uri).pipe(
      Effect.andThen((doc) =>
        twinCompletionsToVscode(
          regions.region,
          doc.document,
          doc.document.offsetAt(params.position),
        ),
      ),
      Runtime.runPromise,
    );

    return CompletionList.create(items);
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
  Effect.provide(Layer.fresh(LoggerLive)),
  Effect.provide(NodeContext.layer),
  Effect.catchAll((error) => Effect.log(`Language server failed: ${error}`)),
);

Runtime.runFork(program);

NodeRuntime.runMain(Runtime.runtimeEffect);
