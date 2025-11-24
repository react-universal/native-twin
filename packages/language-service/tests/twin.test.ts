import { describe, expect, it } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import { Effect, Iterable, Stream } from 'effect';
import path from 'path';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextEdit } from 'vscode-languageserver-types';
import { JSXParser } from '../src/core/JSXParser.service';
import { LSPAdapterSpec } from '../src/internal/LSPAdapterSpec';
import type { VscodeCompletionItem } from '../src/models/completion.model';
import type { JSXNode } from '../src/models/TwinDsl.models';
import { twinTSExtract } from '../src/programs/twinExtract.program';
import { TwinParser } from '../src/TS';
import { TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('Twin Typescript API', () => {
  it.effect('Executor test', () =>
    Effect.gen(function* () {
      const adapter = yield* LSPAdapterSpec;
      const twinParser = yield* TwinParser.TwinParserContext;
      const cursorOffset = 189;

      const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');
      const document = yield* adapter.getLSPDocument(ComponentPath);
      const cursorPosition = document.positionAt(cursorOffset);
      const regions = yield* adapter.getRegions(ComponentPath);

      expect(regions.length).toBeGreaterThan(0);

      // const region = jsxParser.filterNodeAtPosition(regions, cursorPosition, document);
      const region = document.findRegionAt(regions, cursorPosition);
      if (!region) throw expect(region).toBeDefined();

      const parserResult = twinParser.runTwinParser(region.text, region.range.start);

      const locatedToken = parserResult.composedClasses.find((x) =>
        document.isPositionInRange(document.positionAt(cursorOffset), x.documentLoc.originalRange),
      );
      if (!locatedToken) throw expect(locatedToken).toBeDefined();

      const rules = yield* twinParser.findRulesByKey(locatedToken.classNameText);
      const completions = rules.map(
        (rule): VscodeCompletionItem =>
          rule.toVscode(locatedToken.documentLoc.originalRange, locatedToken.text),
      );

      TextEdit.replace(completions.at(0)!.textEdit.range, completions.at(0)!.textEdit.newText);
      const result = TextDocument.applyEdits(
        document.getDocument(),
        asArray(completions.at(0)?.textEdit),
      );

      console.log(result);
      const raw = result.toString();

      expect(raw).not.eq(document.getText());
      expect(completions.length).toBeGreaterThan(2);
      expect(region).toBeDefined();
    }).pipe(Effect.provide(TestLayer)),
  );
  it.effect('Parse JSX Files', () =>
    Effect.gen(function* () {
      const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');
      const jsxParser = yield* JSXParser;
      const { source, jsxNodes } = yield* twinTSExtract(ComponentPath);

      expect(jsxNodes.length).toBeGreaterThan(0);
      const result = yield* Stream.fromEffect(jsxParser.parseSourceFile(source)).pipe(
        Stream.map((x) => x.jsxDeclarators.flatMap((_) => jsxParser.flatJSXDeclarator(_))),
        Stream.flattenIterables,
        Stream.runFold(
          new Map<string, JSXNode>(),
          (acc, current) => new Map(Iterable.appendAll(acc, current)),
        ),
      );
      expect(result.size).toBeGreaterThan(0);
      const parsed = yield* jsxParser.parseSourceFile(source).pipe(
        Effect.map(({ jsxDeclarators }) =>
          jsxDeclarators.flatMap((_) => Array.from(jsxParser.flatJSXDeclarator(_).entries())),
        ),
        Effect.map((x) => new Map(x)),
      );

      expect(parsed.size).toBeGreaterThan(0);
    }).pipe(Effect.scoped, Effect.provide(TestLayer)),
  );
});
