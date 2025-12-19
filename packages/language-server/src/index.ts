import {
  getClientCapabilities,
  LSPConfig,
  LSPContext,
  LSPModels,
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

  const reportDiagnosticsToClient = Effect.fn(function* (
    diagnostics: t.DocumentDiagnosticReport,
    uri: t.URI,
  ) {
    if (yield* config.configSelector((x) => x.diagnostics === 'off')) return yield* Effect.void;

    const diagnosticList = diagnostics.kind === 'full' ? diagnostics.items : [];
    const report: t.PublishDiagnosticsParams = { diagnostics: diagnosticList, uri };
    const doc = yield* Effect.sync(() => documents.get(uri));
    if (doc) report['version'] = doc.version;

    yield* Effect.promise(() => Connection.sendDiagnostics(report));
  });

  const refreshDiagnostics = Effect.if(
    config.configSelector((_) => _.diagnostics === 'off'),
    {
      onFalse: () => Effect.void,
      onTrue: () => Effect.sync(() => Connection.languages.diagnostics.refresh()),
    },
  );

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);
    const configOptions = params.initializationOptions;

    await runEffect(config.onChangeConfig(configOptions));

    return capabilities;
  });

  Connection.onDidChangeConfiguration(async (changes) => {
    await Effect.andThen(config.config, (currentConfig) =>
      config.onChangeConfig((changes.settings?.['nativeTwin'] as any) ?? currentConfig),
    ).pipe(
      Effect.andThen(() => refreshDiagnostics),
      runEffect,
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
    ).pipe(
      Effect.tap((_) => reportDiagnosticsToClient(_, args[0].textDocument.uri)),
      runEffect,
    );
  });

  Connection.onDocumentColor(async (...params) =>
    languagePrograms.getDocumentColors(...params).pipe(runEffect),
  );

  Connection.onDocumentHighlight(async (...args) =>
    languagePrograms.getDocumentHighLightsProgram(...args).pipe(runEffect),
  );

  Connection.onCompletion(async (params) =>
    languagePrograms.getCompletionsAtPosition
      .apply(params.textDocument.uri, LSPModels.Position.make(params.position))
      .pipe(
        Effect.map((completions) => completions),
        runEffect,
      ),
  );

  Connection.onSelectionRanges(async (_params, _token, _, __) => {
    return [];
  });

  Connection.onCodeAction(async (params, _token, _workDone) =>
    languagePrograms.twinCodeActionsProgram(params).pipe(runEffect),
  );

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

const addPrettyLogger = (refs: FiberRefs.FiberRefs, fiberId: FiberId.Runtime) => {
  const loggers = FiberRefs.getOrDefault(refs, FiberRef.currentLoggers);
  if (!HashSet.has(loggers, Logger.defaultLogger)) return refs;

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
  { updateRefs: addPrettyLogger, immediate: true },
);
