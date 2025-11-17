import { assert, describe, expect, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { TwinRuntimeContextLive } from '../src';
import { TwinParserContext } from '../src/twin/TwinParser.service';
import { runTwinParser, TestLayer } from './dsl';

// { fixture: 'bg-gray-200/10', expectedClasses: 1 },
// { fixture: 'bg-gray-200/10 text(gray medium)', expectedClasses: 2 },
describe('Twin Parser Service %s', () => {
  it.scoped('classNames parser', () =>
    Effect.gen(function* () {
      const result = yield* runTwinParser('bg-gray-200/10', 0);

      expect(result.size).eq(1);
    }).pipe(Effect.provide(TestLayer), Effect.provide(TwinRuntimeContextLive)),
  );

  it.effect('Predict className', () =>
    Effect.gen(function* () {
      const parser = yield* TwinParserContext;
      const offset = 2;
      const result = yield* runTwinParser('bg-gray-200/10 text(gray medium)', offset);

      expect(result.size).eq(2);
      const foundNode = result.findNodeAt(offset);
      if (!foundNode) throw assert.isDefined(foundNode);
      const nextRulesGuess = yield* parser.findRulesByKey(foundNode.lookupText);
      expect(Array.from(nextRulesGuess).length).toBeGreaterThan(0);
      yield* Effect.promise(() =>
        expect(Array.from(nextRulesGuess)).toMatchFileSnapshot('__snapshots__/next_rules.snap'),
      );
    }).pipe(Effect.provide(TestLayer), Effect.provide(Layer.fresh(TwinRuntimeContextLive))),
  );
});

describe('Twin Parser Service language', () => {
  it.effect('Predict className with feature', () =>
    Effect.gen(function* () {
      const parser = yield* TwinParserContext;
      const result = yield* runTwinParser('border-', 0);

      const offset = 7;

      const foundNode = result.findNodeAt(offset);
      if (!foundNode) throw assert.isDefined(foundNode);
      const nextRulesGuess = yield* parser.findRulesByKey(foundNode.lookupText);
      expect(Array.from(nextRulesGuess).length).toBeGreaterThan(0);
      yield* Effect.promise(() =>
        expect(Array.from(nextRulesGuess)).toMatchFileSnapshot(
          '__snapshots__/rule_dictionary.snap',
        ),
      );
    }).pipe(Effect.provide(TestLayer), Effect.provide(Layer.fresh(TwinRuntimeContextLive))),
  );
});
