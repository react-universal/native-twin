import { assert, describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';
import { TwinParserContext } from '../src/core/TwinParser.service';
import { runTwinParser, TestLayer } from './dsl';

describe('Twin Parser Service %s', () => {
  it.scoped('classNames parser', () =>
    Effect.gen(function* () {
      const result = yield* runTwinParser('bg-gray-200/10', 0);

      expect(result.result.length).eq(1);
    }).pipe(Effect.provide(TestLayer)),
  );

  it.effect('Predict className', () =>
    Effect.gen(function* () {
      const offset = 2;
      const result = yield* runTwinParser('bg-gray-200 text(gray medium)', offset);
      const parser = yield* TwinParserContext;

      expect(result.result.length).eq(2);
      const foundNode = yield* parser.findByParsed(
        result.result.find((x) => offset >= x.startOffset && offset <= x.endOffset)!.parsed,
      );
      if (!foundNode) throw assert.isDefined(foundNode);
      const nextRulesGuess = yield* parser.findRulesByKey(foundNode[0].sheetEntry.className);
      expect(Array.from(nextRulesGuess).length).toBeGreaterThan(0);
      yield* Effect.promise(() =>
        expect(Array.from(nextRulesGuess)).toMatchFileSnapshot('__snapshots__/next_rules.snap'),
      );
    }).pipe(Effect.provide(TestLayer)),
  );
});

// describe('Twin Parser Service language', () => {
//   it.effect('Search for correctToken', () =>
//     Effect.gen(function* () {
//       const offset = 13;

//       const parser = yield* TwinParserContext;
//       const result = yield* runTwinParser('bg-gray text(s)', 0);
//       expect(result.composedClasses.length).toBeGreaterThan(0);
//       const foundNode = parser.findComposedClassAtPosition(result.composedClasses, offset);
//       // const foundNode = result.findNodeAt(offset);

//       if (!foundNode) throw assert.isDefined(foundNode);

//       const nextRulesGuess = yield* parser.findRulesByKey(foundNode.lookupText);
//       expect(nextRulesGuess.length).toBeGreaterThan(0);
//     }).pipe(Effect.provide(TestLayer)),
//   );
//   it.effect('Predict className with feature', () =>
//     Effect.gen(function* () {
//       const parser = yield* TwinParserContext;
//       const result = yield* runTwinParser('border-', 0);

//       const offset = 7;

//       const foundNode = parser.findComposedClassAtPosition(result.composedClasses, offset);
//       if (!foundNode) throw assert.isDefined(foundNode);
//       const nextRulesGuess = yield* parser.findRulesByKey(foundNode.lookupText);
//       expect(Array.from(nextRulesGuess).length).toBeGreaterThan(0);
//       yield* Effect.promise(() =>
//         expect(Array.from(nextRulesGuess)).toMatchFileSnapshot(
//           '__snapshots__/rule_dictionary.snap',
//         ),
//       );
//     }).pipe(Effect.provide(TestLayer)),
  // );
// });
