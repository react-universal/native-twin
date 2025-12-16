import { parsedRuleToEntry } from '@native-twin/core';
import type { TWParsedRule } from '@native-twin/css';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { compose } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as Trie from 'effect/Trie';
import { ComposedClass } from '../internal/parsers/parser.data';
import { parseTwinRules } from '../internal/parsers/TwinParser.runner';
import type * as TwinParserModel from '../models/TwinParser.models';
import { annotatedLayer } from '../utils/effect.utils';
import { TwinRuntimeContext, TwinRuntimeContextLive } from './TwinRuntime.service';

const make = Effect.gen(function* () {
  const { twinTrie, twinRef, styledContext, themeVariants } = yield* TwinRuntimeContext;

  const findRulesByKey = Effect.fn(function* (key: string) {
    const dictionary = yield* twinTrie.get;
    if (key.length === 0) return [] as TwinParserModel.TwinRuleRegistry[];
    return RA.fromIterable(Trie.valuesWithPrefix(dictionary, key));
  });

  const findByParsed = Effect.fn(function* (rule: TWParsedRule) {
    const dictionary = yield* twinTrie.get;
    const tw = yield* twinRef.get;
    return RA.fromIterable(Trie.valuesWithPrefix(dictionary, rule.n)).map((result) => ({
      result,
      sheetEntry: parsedRuleToEntry(rule, tw.context),
    }));
  });

  const getRuleByClassName = Effect.fn(function* (key: string) {
    const dictionary = yield* twinTrie.get;
    if (key.length === 0) return Option.none<TwinParserModel.TwinRuleRegistry>();
    return Trie.get(dictionary, key);
  });

  const runTwinParser = compose(parseTwinRules, ComposedClass.createComposedClasses);
  const runTW = (classNames: string) => twinRef.get.pipe(Effect.andThen((fn) => fn(classNames)));

  const runFullParserEffect = Effect.fn('TwinParser: run full parser')(function* (
    text: string,
    documentOffset: number,
  ): Effect.fn.Return<TwinParserModel.ResolvedTwinResult[]> {
    const parserResult = compose(
      parseTwinRules,
      ComposedClass.createComposedClasses,
    )({ startOffset: documentOffset, text });

    return yield* Stream.fromIterable(parserResult.result).pipe(
      Stream.mapEffect((parsedRegion) =>
        Effect.andThen(getRuleByClassName(parsedRegion.parsed.n), (entry) => ({
          entry: Option.getOrNull(entry),
          parsedRegion,
        })),
      ),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
    );
  });

  return {
    data: { themeVariants, twinRef, styledContext, twinTrie },
    findRulesByKey,
    runTW,
    getRuleByClassName,
    runTwinParser,
    runFullParserEffect,
    findByParsed,
  };
}).pipe(
  Effect.withSpan('TwinParserContext'),
  Effect.onError((error) => Effect.log('Error: ', error)),
);

export interface TwinParserContext extends Effect.Effect.Success<typeof make> {}
export const TwinParserContext = Context.GenericTag<TwinParserContext>('parsers/TwinParserContext');
export const TwinParserContextLive = Layer.effect(TwinParserContext, make).pipe(
  Layer.provide(TwinRuntimeContextLive),
  annotatedLayer('TwinParser'),
);
