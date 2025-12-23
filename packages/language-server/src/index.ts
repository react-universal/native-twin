import {
  ConnectionHandlerCtx,
  getClientCapabilities,
  LSPAdapterSpec,
  LSPConfig,
  LSPConstants,
  languagePrograms,
  Position,
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

  // const reportDiagnosticsToClient = Effect.fn(function* (
  //   diagnostics: t.DocumentDiagnosticReport,
  //   uri: t.URI,
  // ) {
  //   if (yield* config.configSelector((x) => x.diagnostics === 'off')) return yield* Effect.void;

  //   const diagnosticList = diagnostics.kind === 'full' ? diagnostics.items : [];
  //   const report: t.PublishDiagnosticsParams = { diagnostics: diagnosticList, uri };
  //   const doc = yield* getDocument(uri);
  //   if (doc) report['version'] = doc.version;

  //   yield* Effect.promise(() => connection.sendDiagnostics(report));
  // });

  // const refreshDiagnostics = Effect.if(
  //   config.configSelector((_) => _.diagnostics === 'off'),
  //   {
  //     onFalse: () => Effect.void,
  //     onTrue: () => Effect.sync(() => connection.languages.diagnostics.refresh()),
  //   },
  // );

  connection.languages.foldingRange.on(async (params, ..._rest) =>
    Effect.gen(function* () {
      t.FoldingRange.create(1, 2, 1, 3, t.FoldingRangeKind.Region, '...');
      const { getLSPDocument } = yield* LSPAdapterSpec;

      const document = yield* getLSPDocument(params.textDocument.uri);
      return document.parsableRegions.map(({ attr }) => {
        const start = document.positionAt(attr.startOffset);
        const end = document.positionAt(attr.endOffset);
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

      const regions = document.parsableRegions.flatMap((x) => {
        const parsedRegion = parser.runTwinParser({
          text: x.attr.text,
          startOffset: x.attr.startOffset,
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

      const regions = document.parsableRegions.flatMap((x) => {
        const parsedRegion = parser.runTwinParser({
          text: x.attr.text,
          startOffset: x.attr.startOffset,
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
    languagePrograms.getCompletionEntryDetails(...args).pipe(runEffect),
  );

  connection.onHover(async (...args) => languagePrograms.getHoverDetails(...args).pipe(runEffect));

  connection.languages.diagnostics.on(async (...args) => {
    return Effect.andThen(
      config.configSelector((x) => x),
      (x) =>
        x.diagnostics === 'off'
          ? Effect.succeed<t.DocumentDiagnosticReport>({ kind: 'full', items: [] })
          : languagePrograms.getDocumentDiagnosticsProgram(...args),
    ).pipe(
      Effect.tap((_) => sendDiagnostics(_, args[0].textDocument.uri)),
      Effect.andThen((): t.DocumentDiagnosticReport => ({ kind: 'full', items: [] })),
      runEffect,
    );
  });

  connection.onDocumentColor(async (...params) =>
    languagePrograms.getDocumentColors(...params).pipe(runEffect),
  );

  connection.onDocumentHighlight(async (...args) =>
    languagePrograms.getDocumentHighLightsProgram(...args).pipe(runEffect),
  );

  connection.onCompletion(async (params) =>
    languagePrograms.getCompletionsAtPosition
      .apply(params.textDocument.uri, Position.make(params.position))
      .pipe(
        Effect.tap(() =>
          Effect.promise(() =>
            connection.workspace.getConfiguration({
              scopeUri: params.textDocument.uri,
              section: LSPConstants.vscodeConfigSection,
            }),
          ).pipe(
            Effect.andThen((settings) =>
              Effect.log('settings: ', inspect(settings, false, null, false)),
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
    languagePrograms.twinCodeActionsProgram(params).pipe(runEffect),
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
