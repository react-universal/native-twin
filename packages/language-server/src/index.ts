import {
  getClientCapabilities,
  LSPConfig,
  LSPContext,
  languagePrograms,
} from '@native-twin/language-service';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import type * as FiberId from 'effect/FiberId';
import * as FiberRef from 'effect/FiberRef';
import * as FiberRefs from 'effect/FiberRefs';
import * as HashSet from 'effect/HashSet';
import type * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import type * as t from 'vscode-languageserver';
import { LspMainLive } from './services/LSP.service';

const LSPRuntime = ManagedRuntime.make(LspMainLive);

const runEffect = <A, E>(
  effect: Effect.Effect<A, E, Layer.Layer.Success<typeof LspMainLive>>,
): Promise<A> => LSPRuntime.runPromise(effect);

const program = Effect.gen(function* () {
  const { connection: Connection, documents } = yield* LSPContext;
  const config = yield* LSPConfig;
  // const internalRuntime = yield* Runtime;

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);
    const configOptions = params.initializationOptions;

    await runEffect(config.onChangeConfig(configOptions));

    return capabilities;
  });

  Connection.onDidChangeConfiguration(async (changes) => {
    await config.config.pipe(
      Effect.andThen((currentConfig) =>
        config
          .onChangeConfig((changes.settings?.['nativeTwin'] as any) ?? currentConfig)
          .pipe(
            Effect.andThen(() =>
              currentConfig.diagnostics === 'off'
                ? Connection.languages.diagnostics.refresh()
                : Effect.void,
            ),
          ),
      ),
      Effect.runPromise,
    );
  });

  Connection.onCompletionResolve(async (...args) =>
    languagePrograms.getCompletionEntryDetails(...args).pipe(runEffect),
  );

  Connection.onHover(async (...args) => languagePrograms.getHoverDetails(...args).pipe(runEffect));

  Connection.languages.diagnostics.on(async (...args) => {
    return Effect.andThen(
      config.configSelector((x) => x),
      (x) =>
        x.diagnostics === 'off'
          ? Effect.succeed<t.DocumentDiagnosticReport>({ kind: 'full', items: [] })
          : languagePrograms.getDocumentDiagnosticsProgram(...args),
    ).pipe(runEffect);
  });

  Connection.onDocumentColor(async (...params) =>
    languagePrograms.getDocumentColors(...params).pipe(runEffect),
  );

  Connection.onDocumentHighlight(async (...args) => {
    const data = await languagePrograms.getDocumentHighLightsProgram(...args).pipe(runEffect);
    return data;
  });

  Connection.onCompletion(async (params) =>
    languagePrograms.getCompletionsAtPosition.apply(params.textDocument.uri, params.position).pipe(
      Effect.map((completions) => completions),
      runEffect,
    ),
  );
  // yield* addServerRequestHandler(Connection.onCompletion, (params) => {
  //   return languagePrograms.getCompletionsAtPosition
  //     .apply(params.textDocument.uri, params.position)
  //     .pipe(
  //       Effect.map((comp) => comp.completions),
  //       Effect.provide(LspMainLive),
  //     );
  // });

  Connection.onSelectionRanges(async (_params, _token, _, __) => {
    return [];
  });

  Connection.onCodeAction(async (params, _token, _workDone) =>
    languagePrograms.twinCodeActionsProgram(params).pipe(runEffect),
  );

  Connection.onCodeActionResolve(async (params) => {
    // console.log('PARAMS: ', params);
    return {
      ...params,
    };
  });

  const listener = documents.listen(Connection);
  Connection.listen();

  Connection.onShutdown(() => {
    Connection.console.log('shootDown');
    Connection.dispose();
    listener.dispose();
  });

  Effect.addFinalizer((exit) => {
    Connection.console.debug('Disposing Connection...');
    Connection.dispose();
    Connection.console.debug('Disposing Documents Handler...');
    listener.dispose();
    Connection.console.debug(`Closing reason: ${exit.toJSON()}`);
    return Effect.void;
  });
}).pipe(
  Effect.uninterruptible,
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.catchAll((error) => Effect.log(`Language server failed: ${error}`)),
);

// const runner = Runtime.pipe(Effect.map((x) => EffectRuntime.runFork(x, Effect.scoped(program))));

const addPrettyLogger = (refs: FiberRefs.FiberRefs, fiberId: FiberId.Runtime) => {
  const loggers = FiberRefs.getOrDefault(refs, FiberRef.currentLoggers);
  if (!HashSet.has(loggers, Logger.defaultLogger)) {
    return refs;
  }
  return FiberRefs.updateAs(refs, {
    fiberId,
    fiberRef: FiberRef.currentLoggers,
    value: loggers.pipe(
      HashSet.remove(Logger.defaultLogger),
      HashSet.add(Logger.prettyLoggerDefault),
    ),
  });
};

LSPRuntime.runFork(
  Effect.tapErrorCause(program, (cause) => {
    if (Cause.isInterruptedOnly(cause)) return Effect.void;
    return Effect.logError(cause);
  }),
  { updateRefs: addPrettyLogger },
);

// const running = EffectRuntime.runFork(EffectRuntime.make({
//   context: Runtime.memoMap.
// }), program);
// NodeRuntime.runMain(program.pipe(Effect.provide()), {
// disableErrorReporting: false,
// disablePrettyLogger: false,
// });
