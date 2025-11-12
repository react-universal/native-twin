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
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as SortedSet from 'effect/SortedSet';
import * as Trie from 'effect/Trie';
import type { InternalTwinConfig } from '../models/twin/native-twin.types';
import { DEFAULT_RULE_META } from '../utils/constants.utils';
import { requireJS } from '../utils/load-js';
import { composeDeclarations, createStyledContext } from '../utils/sheet.utils';
import {
  TwinParseResultHandler,
  type TwinParserModel,
  TwinRuleNode,
  TwinVariantNode,
} from './TwinParser.models';

const make = Effect.gen(function* () {
  const twinConfigPath = yield* Config.string('twinConfigPath');
  const twinConfig = Option.getOrElse(requireJS(twinConfigPath), () => defaultConfig);
  const twin = setup(twinConfig);
  const styledContext = createStyledContext(twinConfig.root.rem);
  const themeRules = getThemeRules(twinConfig);
  const themeVariants = getThemeVariants(twinConfig);

  const dictionary = yield* Effect.cached(
    Effect.sync(() =>
      pipe(
        RA.flatMap(themeRules, expandRule),
        RA.map((x) => [x.className, x] as const),
        Trie.fromIterable,
      ),
    ),
  );

  const findRulesByKey = Effect.fn(function* (key: string) {
    if (key.length === 0) return [] as TwinParserModel.ExpandedRule[];
    return Array.from(Trie.valuesWithPrefix(yield* dictionary, key));
  });

  return {
    data: { themeVariants, themeRules, styledContext, twin, dictionary },
    findRulesByKey,
    getThemeSectionKeys,
    getThemeColorPalette,
    getThemeOpacities,
    getThemeScreenEntries,
    runTwinParser: (rawText: string, startsAt: number) => {
      const { text, position } = adjustParserInput(rawText, startsAt);
      const parsed = P.many1(
        P.whitespaceSurrounded(
          P.choice([parseRuleGroupWeak, parseVariantClass, parseVariant, parseClassName]),
        ),
      ).run(text);

      return new TwinParseResultHandler(parsed, { text, position });
    },
  };

  function expandRule(rule: TwinParserModel.TwinRuleNode): TwinParserModel.ExpandedRule[] {
    return TwinRuleNode.$match(rule, {
      ThemedKey: (themeRule): TwinParserModel.ExpandedRule[] => {
        const flattenSection = flattenObjectByPath(twin.theme(themeRule.themeSection as any));
        return Object.entries(flattenSection).flatMap(([key, value]) => {
          let className = themeRule.pattern.endsWith('-')
            ? themeRule.pattern.concat(key)
            : themeRule.pattern.concat('-').concat(key);
          className = className.replace(/.*[-]?DEFAULT[-]?/, '');
          if (className.endsWith('-')) return [];
          if (className === '') return [];
          return { className, key, value, meta: themeRule.meta };
        });
      },
      UnKeyed: (computedRule): TwinParserModel.ExpandedRule[] => {
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
        return [
          {
            value,
            className: computedRule.pattern,
            key: computedRule.pattern,
            meta: computedRule.meta,
          },
        ];
      },
    });
  }
});

/** DSL */
const getThemeRules = (config: InternalTwinConfig): TwinParserModel.TwinRuleNode[] => {
  return pipe(
    RA.fromIterable(config.rules),
    RA.flatMap((rule): TwinParserModel.TwinRuleNode[] =>
      pipe(
        RA.fromIterable(rule[0].split('|')),
        RA.map(
          (pattern): TwinParserModel.TwinRuleNode =>
            typeof rule[1] === 'string'
              ? TwinRuleNode.ThemedKey({
                  pattern,
                  meta: rule[3] ?? DEFAULT_RULE_META,
                  resolver: rule[2],
                  themeSection: rule[1] as Data.TaggedEnum.Value<
                    TwinParserModel.TwinRuleNode,
                    'ThemedKey'
                  >['themeSection'],
                })
              : TwinRuleNode.UnKeyed({
                  pattern,
                  meta: rule[3] ?? DEFAULT_RULE_META,
                  resolver: rule[2],
                }),
        ),
      ),
    ),
  );
};

const getThemeVariants = (
  config: InternalTwinConfig,
): HashSet.HashSet<TwinParserModel.TwinVariantNode> =>
  HashSet.fromIterable(config.variants).pipe(
    HashSet.map((variant): TwinParserModel.TwinVariantNode => {
      if (typeof variant[1] === 'function') {
        return TwinVariantNode.Resolver({ pattern: variant[0], value: variant[1] });
      }
      return TwinVariantNode.Literal({ pattern: variant[0], value: variant[1] });
    }),
  );

const getThemeSectionKeys = (config: InternalTwinConfig) => {
  const keys = [...keysOf(config.theme), ...keysOf(config.theme.extend ?? {})].filter(
    (x) => x !== 'extend',
  );
  return SortedSet.fromIterable(keys, Order.string);
};

const getThemeColorPalette = (config: InternalTwinConfig) =>
  HashMap.fromIterable(Object.entries(config.theme.colors ?? {})).pipe(
    HashMap.union(HashMap.fromIterable(Object.entries(config.theme.extend?.colors ?? {}))),
  );

const getThemeOpacities = (config: InternalTwinConfig) =>
  pipe(
    RA.fromIterable(Object.entries(config.theme.opacity ?? {})),
    RA.union(HashMap.fromIterable(Object.entries(config.theme.extend?.opacity ?? {}))),
  );

const getThemeScreenEntries = (config: InternalTwinConfig) =>
  HashMap.fromIterable(Object.entries(config.theme.screens ?? {})).pipe(
    HashMap.union(HashMap.fromIterable(Object.entries(config.theme.extend?.screens ?? {}))),
  );

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
