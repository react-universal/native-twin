import { assert, describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';
import { TwinParserContext } from '../src/parser/TwinParser.service';
import { TestLayer } from './dsl';

describe.each([
  { fixture: 'bg-gray-200/10', expectedClasses: 1 },
  { fixture: 'bg-gray-200/10 text(gray medium)', expectedClasses: 2 },
])('Twin Parser Service %s', (matchers) => {
  it.effect('classNames parser', () =>
    Effect.gen(function* () {
      const parser = yield* TwinParserContext;
      const result = parser.runTwinParser(matchers.fixture, 0);

      expect(result.size).eq(matchers.expectedClasses);
    }).pipe(Effect.provide(TestLayer)),
  );

  it.effect('Predict className', () =>
    Effect.gen(function* () {
      const offset = 2;
      const parser = yield* TwinParserContext;
      const result = parser.runTwinParser(matchers.fixture, offset);
      expect(result.size).eq(matchers.expectedClasses);
      const foundNode = result.findNodeAt(offset);
      if (!foundNode) throw assert.isDefined(foundNode);
      const nextRulesGuess = yield* parser.findRulesByKey(foundNode.lookupText);
      expect(Array.from(nextRulesGuess).length).toBeGreaterThan(0);
      expect(Array.from(nextRulesGuess)).toMatchSnapshot('Guess next rules');
    }).pipe(Effect.provide(TestLayer)),
  );
});
