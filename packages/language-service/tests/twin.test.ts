import { describe, expect, it } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import path from 'path';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPAdapterSpec, TwinParserContext } from '../src';
import { TwinCompletionItem } from '../src/models/Completion.model';
import type {
  ParsedRuleWithLocation,
  TwinParserOutput,
  TwinRuleRegistry,
} from '../src/models/TwinParser.models';
import { TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('Twin Typescript API', () => {
  it.effect('Executor test', () =>
    Effect.gen(function* () {
      const adapter = yield* LSPAdapterSpec;
      const twinParser = yield* TwinParserContext;
      const cursorOffset = 189;

      const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');
      const document = yield* adapter.getLSPDocument(ComponentPath);
      const cursorPosition = document.positionAt(cursorOffset);
      const regions = yield* adapter.getRegions(ComponentPath);

      expect(regions.length).toBeGreaterThan(0);

      const region = document.findRegionAt(cursorPosition);
      if (!region) throw expect(region).toBeDefined();

      const text = region?.text;
      let parserResult: TwinParserOutput | null | undefined = null;
      let locatedToken: ParsedRuleWithLocation | null | undefined = null;
      const twinTokens: TwinRuleRegistry[] = [];
      if (!!region && !!text) {
        parserResult = twinParser.runTwinParser({
          startOffset: document.offsetAt(region.range.start),
          text,
        });

        locatedToken = parserResult.result.find(
          (token) => cursorOffset >= token.startOffset && cursorOffset <= token.endOffset,
        );

        if (locatedToken) {
          const rules = yield* twinParser.findRulesByKey(locatedToken.parsed.n);
          twinTokens.push(...rules);
        }
      }

      if (!locatedToken) throw expect(locatedToken).toBeDefined();

      const rules = yield* twinParser.findRulesByKey(locatedToken.parsed.n);

      const completions = rules.map(
        (rule) => new TwinCompletionItem(rule, locatedToken, cursorOffset, document).toCompletion(),
      );
      const result = TextDocument.applyEdits(
        document.getDocument(),
        asArray(completions.at(0)!.additionalTextEdits),
      );

      console.log(result);
      const raw = result.toString();

      expect(raw).not.eq(document.getText());
      expect(completions.length).toBeGreaterThan(2);
      expect(region).toBeDefined();
    }).pipe(Effect.provide(TestLayer)),
  );
});
