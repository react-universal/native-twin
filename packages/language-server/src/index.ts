import {
  ConnectionHandlerCtx,
  getClientCapabilities,
  LanguageServerHandlers,
  LSPAdapterSpec,
  LSPConfig,
  LSPConstants,
  TwinParserContext,
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
import { inspect } from 'util';
import * as t from 'vscode-languageserver';
import * as types from 'vscode-languageserver-types';
import { LspMainLive } from './services/LSP.service';

const LSPRuntime = ManagedRuntime.make(LspMainLive);

const runEffect = <A, E>(
  effect: Effect.Effect<A, E, Layer.Layer.Success<typeof LspMainLive>>,
): Promise<A> => LSPRuntime.runPromise(effect);

const program = Effect.gen(function* () {
  const { sendDiagnostics, connection } = yield* ConnectionHandlerCtx;
  const config = yield* LSPConfig;
  const handlers = yield* LanguageServerHandlers;

  connection.languages.foldingRange.on(async (params, ..._rest) =>
    Effect.gen(function* () {
      const { getLSPDocument } = yield* LSPAdapterSpec;

      const document = yield* getLSPDocument(params.textDocument.uri);
      return document.parsableRegions.map(({ data }) => {
        const start = document.positionAt(data.value.startOffset);
        const end = document.positionAt(data.value.endOffset);
        return t.FoldingRange.create(
          start.line,
          end.line,
          start.character,
          end.character - 1,
          t.FoldingRangeKind.Region,
        );
      });
    }).pipe(runEffect),
  );

  connection.languages.semanticTokens.onRange(async (params, ..._rest) => {
    const data = await Effect.gen(function* () {
      const { getLSPDocument } = yield* LSPAdapterSpec;
      const parser = yield* TwinParserContext;
      const document = yield* getLSPDocument(params.textDocument.uri);
      const builder = new t.SemanticTokensBuilder();

      const regions = document.parsableRegions.flatMap(({ data }) => {
        const parsedRegion = parser.runTwinParser({
          text: data.value.text,
          startOffset: data.value.startOffset,
        });
        return parsedRegion.result;
      });

      for (const parsedRegion of regions) {
        if (parsedRegion.raw.type !== 'CLASS_NAME') continue;

        const range = document.getRangeFor(parsedRegion.startOffset, parsedRegion.endOffset);
        builder.push(
          range.start.line,
          range.start.character,
          parsedRegion.startOffset - parsedRegion.endOffset,
          types.CompletionItemKind.Color,
          types.CompletionItemKind.Value,
        );
      }
      return builder.build();
    }).pipe(runEffect);
    return data;
  });

  connection.languages.semanticTokens.on(async (params, _t, _a, _b) => {
    const data = await Effect.gen(function* () {
      const { getLSPDocument } = yield* LSPAdapterSpec;
      const parser = yield* TwinParserContext;
      const document = yield* getLSPDocument(params.textDocument.uri);
      const builder = new t.SemanticTokensBuilder();

      const regions = document.parsableRegions.flatMap(({ data }) => {
        const parsedRegion = parser.runTwinParser({
          text: data.value.text,
          startOffset: data.value.startOffset,
        });
        return parsedRegion.result;
      });

      for (const parsedRegion of regions) {
        if (parsedRegion.raw.type !== 'CLASS_NAME') continue;

        const range = document.getRangeFor(parsedRegion.startOffset, parsedRegion.endOffset);
        builder.push(
          range.start.line,
          range.start.character,
          parsedRegion.startOffset - parsedRegion.endOffset,
          types.CompletionItemKind.Color,
          types.CompletionItemKind.Value,
        );
      }
      return builder.build();
    }).pipe(runEffect);

    return data;
  });

  connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);
    const configOptions = params.initializationOptions;

    await runEffect(config.onChangeConfig(configOptions));

    return capabilities;
  });

  connection.onDidChangeConfiguration(async (changes) => {
    await Effect.andThen(config.config, (currentConfig) =>
      config.onChangeConfig((changes.settings?.['nativeTwin'] as any) ?? currentConfig),
    ).pipe(
      // Effect.andThen(() => refreshDiagnostics),
      runEffect,
    );
  });

  connection.onCompletionResolve(async (...args) =>
    handlers.getCompletionEntryDetails(...args).pipe(runEffect),
  );

  connection.onHover(async (...args) => handlers.getHoverDetails(...args).pipe(runEffect));

  connection.languages.diagnostics.on(async (...args) => {
    return Effect.andThen(
      config.configSelector((x) => x),
      (x) =>
        x.diagnostics === 'off'
          ? Effect.succeed<t.DocumentDiagnosticReport>({ kind: 'full', items: [] })
          : handlers.getDocumentDiagnosticsProgram(...args),
    ).pipe(
      Effect.tap((_) => sendDiagnostics(_, args[0].textDocument.uri)),
      Effect.andThen((): t.DocumentDiagnosticReport => ({ kind: 'full', items: [] })),
      runEffect,
    );
  });

  connection.onDocumentColor(async (...params) =>
    handlers.getDocumentHighLights(...params).pipe(runEffect),
  );

  connection.onDocumentHighlight(async (...args) =>
    handlers.getDocumentHighLights(...args).pipe(runEffect),
  );

  connection.onCompletion(async (params) =>
    handlers.getCompletionsAtPosition(params.textDocument.uri, params.position).pipe(
      Effect.tap(() =>
        Effect.promise(() =>
          connection.workspace.getConfiguration({
            scopeUri: params.textDocument.uri,
            section: LSPConstants.vscodeConfigSection,
          }),
        ).pipe(
          Effect.andThen((settings) =>
            Effect.logDebug('settings: ', inspect(settings, false, null, false)),
          ),
        ),
      ),
      // Effect.map((completions) => completions),
      runEffect,
    ),
  );

  connection.onSelectionRanges(async (_params, _token, _, __) => {
    return [];
  });

  connection.onCodeAction(async (params, _token, _workDone) =>
    handlers.twinCodeActionsProgram(params).pipe(runEffect),
  );
}).pipe(
  Effect.scoped,
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
