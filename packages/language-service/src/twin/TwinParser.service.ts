import * as P from '@native-twin/arc-parser';
import { setup } from '@native-twin/core';
import * as TwParser from '@native-twin/css/tailwind-parser';
import { flattenObjectByPath, keysOf } from '@native-twin/helpers';
import defaultConfig from '@native-twin/preset-tailwind/default-config';
import * as RA from 'effect/Array';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import type * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as Trie from 'effect/Trie';
import type { InternalTwFn, InternalTwinConfig } from '../models/twin/native-twin.types';
import { requireJS } from '../utils/load-js';
import { composeDeclarations, createStyledContext } from '../utils/sheet.utils';
import * as TwinParserModel from './models/TwinParser.models';
import * as TwinUtils from './TwinParser.utils';

const make = Effect.gen(function* () {
  const twinConfigPath = yield* Config.string('twinConfigPath');
  const twinConfig = Option.getOrElse(requireJS(twinConfigPath), () => defaultConfig);
  const twin: InternalTwFn = setup(twinConfig);
  const styledContext = createStyledContext(twinConfig.root.rem);
  const themeRules = TwinUtils.getThemeRules(twinConfig);
  const themeVariants = TwinUtils.getThemeVariants(twinConfig);
  const dictionary = yield* Effect.cached(
    Effect.sync(() =>
      pipe(
        RA.flatMap(themeRules, (_) => TwinUtils.getTwinRuleExpansions(_, twin, styledContext)),
        RA.map((x) => [x.className, x] as const),
        Trie.fromIterable,
      ),
    ),
  );

  const resolveThemeSection = yield* Effect.cachedFunction(
    (section: keyof InternalTwinConfig['theme']) =>
      Effect.sync(() => flattenObjectByPath(twin.theme(section))),
  );

  const themeRuless = Stream.fromIterable(twin.config.rules).pipe(
    Stream.map((rule) => TwinUtils.getTaggedRule(rule)),
    Stream.partition((x) => x._tag === 'ThemedKey'),
    Stream.flatMap(([_unKeyedRule, _themeRules]): Stream.Stream<TwinParserModel.ExpandedRule> => {
      const themeRules = _themeRules.pipe(
        Stream.mapEffect((rule) =>
          Effect.zip(Effect.succeed(rule), resolveThemeSection(rule.themeSection)),
        ),
        Stream.map(([themeRule, section]) => {
          return Object.entries(section).flatMap(([key, value]) => {
            const className = TwinUtils.sanitizeClassName(themeRule, key);
            if (className.endsWith('-')) return [];
            if (className === '') return [];
            return { className, key, value, meta: themeRule.meta };
          });
        }),
        Stream.flattenIterables,
      );

      const unKeyedRule = _unKeyedRule.pipe(
        Stream.map((computedRule) => {
          let value = twin.theme(computedRule.pattern as any);
          if (typeof value === 'object') {
            value = computedRule.resolver(
              {
                base: computedRule.pattern,
                negative: computedRule.meta.canBeNegative,
                segment: { type: 'segment', value: '' },
                suffixes: [],
              },
              twin.context,
              TwParser.parseTWTokens(computedRule.pattern)[0],
            );
            if (typeof value === 'object') {
              value = composeDeclarations(value.declarations, styledContext);
            }
          }
          return {
            value,
            className: computedRule.pattern,
            key: computedRule.pattern,
            meta: computedRule.meta,
          };
        }),
      );

      return Stream.merge(themeRules, unKeyedRule);
    }),
  );

  const findRulesByKey = Effect.fn(function* (key: string) {
    if (key.length === 0) return [] as TwinParserModel.ExpandedRule[];
    return Array.from(Trie.valuesWithPrefix(yield* dictionary, key));
  });

  const composeThemedRule = yield* Effect.cachedFunction(
    (rule: Data.TaggedEnum.Value<TwinParserModel.TwinRuleNode, 'ThemedKey'>) =>
      Effect.gen(function* () {
        const themeSection = yield* resolveThemeSection(rule.themeSection);
        const compositions = new Set(
          keysOf(themeSection).map(
            (_) =>
              [
                TwinUtils.sanitizeClassName(rule, _),
                { value: themeSection[_], resolver: rule.resolver },
              ] as const,
          ),
        );
        return compositions;
      }),
  );
  const composUnKeyedRule = yield* Effect.cachedFunction(
    (computedRule: Data.TaggedEnum.Value<TwinParserModel.TwinRuleNode, 'UnKeyed'>) =>
      Effect.sync(() => {
        let value = twin.theme(computedRule.pattern as any);
        if (typeof value === 'object') {
          value = computedRule.resolver(
            {
              base: computedRule.pattern,
              negative: computedRule.meta.canBeNegative,
              segment: { type: 'segment', value: '' },
              suffixes: [],
            },
            twin.context,
            TwParser.parseTWTokens(computedRule.pattern)[0],
          );
          if (typeof value === 'object') {
            value = composeDeclarations(value.declarations, styledContext);
          }
        }

        return new Set([[computedRule.pattern, value]] as const);
      }),
  );

  const createRuleHandler = Effect.fn(function* (rule: TwinParserModel.TwinRuleNode) {
    if (rule._tag === 'ThemedKey') {
      return yield* composeThemedRule(rule);
    }
    return yield* composUnKeyedRule(rule);
  });

  return {
    data: { themeVariants, themeRules, styledContext, twin, dictionary },
    findRulesByKey,
    runTwinParser: (rawText: string, startsAt: number) => {
      const { text, position } = adjustParserInput(rawText, startsAt);
      const parsed = P.many1(
        P.whitespaceSurrounded(
          P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
        ),
      ).run(text);

      return new TwinParserModel.TwinParseResultHandler(parsed, { text, position });
    },
  };
});

/** DSL */

/** PARSER */

const adjustParserInput = (rawText: string, startsAt: number) => {
  const replacementToken = ["'", '`'].find((_) => rawText.startsWith(_)) ?? '';
  return {
    text: rawText.length > 0 ? rawText.replace(replacementToken, '') : rawText,
    position: startsAt + replacementToken.length,
  };
};

const mapParserToLocation = <A extends object, S = unknown>(
  x: P.ParserState<A, S>,
  initialIndex: number,
): TwinParserModel.WithLocation & A =>
  Object.assign(x.result, {
    start: initialIndex,
    end: x.cursor,
  });

const parseVariant: P.Parser<TwinParserModel.TwinClassVariantToken> =
  TwParser.parseVariant.mapFromState(mapParserToLocation);

/** Match color modifiers like: `.../10` or `.../[...]` */
const colorModifier = P.sequenceOf([
  P.char('/'),
  P.maybe(P.choice([P.digits, TwParser.parseArbitraryValue])),
]).map((x) => TwParser.mapColorModifier(x[1] ?? 'NONE'));

/** Match classnames with important prefix arbitrary and color modifiers */
const parseClassName: P.Parser<TwinParserModel.TwinClassNameToken> = P.sequenceOf([
  TwParser.parseMaybeImportant,
  P.regex(TwParser.classNameIdent),
  P.maybe(TwParser.parseArbitraryValue),
  P.maybe(colorModifier),
])
  .map((x) => TwParser.mapClassName({ i: x[0], n: x[1] + (x[2] ? x[2] : ''), m: x[3] }))
  .mapFromState(mapParserToLocation);

const parseVariantClass: P.Parser<TwinParserModel.TwinClassNameVariantToken> =
  TwParser.parseVariantClass.mapFromState(mapParserToLocation);

const parseArbitraryValue: P.Parser<TwinParserModel.TwinArbitraryToken> =
  TwParser.parseArbitraryValue.map(TwParser.mapArbitrary).mapFromState(mapParserToLocation);

const parseValidTokenRecursiveWeak: P.Parser<
  | TwinParserModel.TwinClassGroupToken
  | TwinParserModel.TwinClassVariantToken
  | TwinParserModel.TwinClassNameToken
  | TwinParserModel.TwinClassNameVariantToken
> = P.recursiveParser(() =>
  P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
);

/** Match any valid TW ident or arbitrary separated by spaces */
const parseGroupContentWeak: P.Parser<TwinParserModel.AnyTwinClassToken[]> = P.sequenceOf([
  P.char('('),
  P.many1(P.choice([parseValidTokenRecursiveWeak, parseArbitraryValue, P.skip(P.whitespace)])),
  P.maybe(P.char(')')),
]).map((x) => {
  const newValue = x[1].filter(
    (y): y is TwinParserModel.AnyTwinClassToken => typeof y !== 'string' && y !== null,
  );
  return newValue;
});

const parseRuleGroupWeak: P.Parser<TwinParserModel.TwinClassGroupToken> = P.choice([
  P.sequenceOf([parseVariant, parseGroupContentWeak]),
  P.sequenceOf([parseClassName, parseGroupContentWeak]),
]).mapFromState((x, i): TwinParserModel.TwinClassGroupToken => {
  const { type, value } = TwParser.mapGroup({ base: x.result[0], composes: x.result[1] });
  return mapParserToLocation({ ...x, result: { type, ...value } }, i);
});

export interface TwinParserContext extends Effect.Effect.Success<typeof make> {}
export const TwinParserContext = Context.GenericTag<TwinParserContext>('parsers/TwinParserContext');
export const TwinParserContextLive = Layer.effect(TwinParserContext, make);
