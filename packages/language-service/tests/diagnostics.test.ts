/** @effect-diagnostics multipleEffectProvide:skip-file */
import path from 'node:path';
import { describe, expect, it } from '@effect/vitest';
import { Chunk, Effect, Layer, Schedule } from 'effect';
import ts from 'ts-morph';
import * as t from 'vscode-languageserver';
import * as Documents from 'vscode-languageserver-textdocument';
import {
  getDuplicatedDeclarationCodeAction,
  LSPAdapterSpec,
  LSPConfig,
  TwinDiagnosticCodes,
  TwinParserContextLive,
  TwinRuntimeContext,
  TwinRuntimeContextLive,
} from '../src';
import { TypeScriptApi } from '../src/adapters/Typescript/TypescriptAPI.service';
import {
  createDiagnosticsHandler,
  isValidTwinDiagnostic,
} from '../src/core/handlers/diagnostics.handler';
import { TestVscodeLSPAdapterLive } from './dsl/adapter.mock';
import { lspConfigMock, TsProgramLive } from './dsl/layer';

const FixturesDir = path.join(__dirname, 'fixtures/react');

// Test-specific layer: only the adapter + parser are needed to produce
// diagnostics. TwinGraphos / vscode wiring is intentionally left out.
// `TwinRuntimeContextLive` is the SAME reference the parser provides internally,
// so a single merged build memoizes it once -> booting it here also populates the
// parser trie.
const DiagnosticsTestLayer = Layer.empty.pipe(
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TwinRuntimeContextLive),
  Layer.provideMerge(TestVscodeLSPAdapterLive),
  Layer.provideMerge(TsProgramLive),
  Layer.provideMerge(Layer.succeed(TypeScriptApi, ts)),
  Layer.provideMerge(Layer.effect(LSPConfig, lspConfigMock)),
);

describe('Test diagnostics', () => {
  it.effect('reports duplicated classNames and creates a single codeFix', () =>
    Effect.gen(function* () {
      const adapter = yield* LSPAdapterSpec;
      const runtime = yield* TwinRuntimeContext;
      const diagnostics = yield* createDiagnosticsHandler;

      const uri = path.join(FixturesDir, 'Duplicated.tsx');

      // Boot the (shared) twin runtime so the parser trie is populated.
      yield* runtime.bootTwinRuntime(path.join(FixturesDir, 'tailwind.config.ts'));

      // Boot also races the config-changes daemon, so retry briefly until ready.
      const reported = yield* Effect.gen(function* () {
        const result = yield* diagnostics.evaluateDocument(uri, 'warn');
        const items = Chunk.toReadonlyArray(result).filter(isValidTwinDiagnostic);
        if (items.length === 0) return yield* Effect.fail('no-diagnostics-yet' as const);
        return items;
      }).pipe(Effect.retry(Schedule.addDelay(Schedule.recurs(25), () => 20)));

      // 1. Duplicated classNames must be reported on the JSX tag. The fixture
      // declares `bg-red-500 bg-blue-500 bg-green-500` (3 background utilities),
      // so several duplicated-declaration diagnostics are produced.
      const duplicated = reported.filter(
        (x) => x.code === TwinDiagnosticCodes.DuplicatedDeclaration,
      );
      expect(duplicated.length).toBeGreaterThan(1);

      // 2. All those diagnostics must collapse into a SINGLE codeFix that removes
      // the duplicated utilities from the whole className list.
      const document = yield* adapter.getLSPDocument(uri);
      const region = document.parsableRegions[0]?.data.value;
      expect(region).toBeDefined();

      const codeFixes = getDuplicatedDeclarationCodeAction(document, region!, duplicated);

      expect(codeFixes).toHaveLength(1);
      expect(codeFixes[0]?.kind).toBe(t.CodeActionKind.QuickFix);
      expect(codeFixes[0]?.isPreferred).toBe(true);

      // The collapsed fix keeps the first declared utility and removes the
      // duplicated ones, so `newText` is the replacement applied to the region.
      const edits = codeFixes[0]?.edit?.changes?.[document.uri];
      const res = Documents.TextDocument.applyEdits(
        document.document,
        codeFixes.flatMap((x) => x.edit?.changes?.[document.uri] ?? []),
      );
      yield* Effect.promise(() => expect(res).toMatchFileSnapshot('__snapshots__/Diagnostic.tsx'));

      expect(edits?.[0]?.newText).toBe('bg-red-500');
    }).pipe(Effect.provide(DiagnosticsTestLayer)),
  );
});
