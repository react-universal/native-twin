import { parseTWTokens } from '@native-twin/css';
import { flattenObjectByPath, keysOf } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import type * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Order from 'effect/Order';
import * as RcMap from 'effect/RcMap';
import * as SortedSet from 'effect/SortedSet';
import type { InternalTwFn, InternalTwinConfig } from '../models/twin/native-twin.types';
import { DEFAULT_RULE_META } from '../utils/constants.utils';
import { composeDeclarations, createStyledContext } from '../utils/sheet.utils';
import { TwinDslModels } from './TwinDsl.models';

export const createTwinDSL = Effect.fn(function* (twin: InternalTwFn) {
  const twinConfig = twin.config;
  const themeKeys = getThemeSectionKeys(twinConfig);
  const screenVariants = getThemeScreenEntries(twinConfig);
  const colors = getThemeColorPalette(twinConfig);
  const opacities = getThemeOpacities(twinConfig);
  const variants = getThemeVariants(twinConfig);
  const rules = getThemeRules(twinConfig);
  const ruleDictionary: HashSet.HashSet<TwinDslModels.TwinRuleNode> = rules.pipe(
    HashSet.flatMap((rule) => HashSet.make(rule)),
  );
  const styledContext = createStyledContext(twinConfig.root.rem);

  const getRulePatternsDictionary = (
    // _themeKeys: SectionKeysSet,
    rules: HashSet.HashSet<TwinDslModels.TwinRuleNode>,
  ) => rules.pipe(HashSet.flatMap((rule) => HashSet.make(rule)));

  const expandRule = (rule: TwinDslModels.TwinRuleNode): [string, TwinDslModels.ExpandedRule][] =>
    TwinDslModels.TwinRuleNode.$match(rule, {
      ThemedKey: (themeRule) => {
        const flattenSection = flattenObjectByPath(twin.theme(themeRule.themeSection as any));
        return Object.entries(flattenSection).map(
          ([key, value]): [string, TwinDslModels.ExpandedRule] => {
            const className = themeRule.pattern.endsWith('-')
              ? themeRule.pattern.concat(key)
              : themeRule.pattern.concat('-').concat(key);
            return [className, { className, value, meta: themeRule.meta }];
          },
        );
      },
      UnKeyed: (computedRule): [string, TwinDslModels.ExpandedRule][] => {
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
            parseTWTokens(computedRule.pattern)[0],
          );
          if (typeof value === 'object') {
            value = composeDeclarations(value.declarations, styledContext);
          }
        }
        return [
          [
            computedRule.pattern,
            { value, className: computedRule.pattern, meta: computedRule.meta },
          ],
        ];
      },
    });

  const expandedRules = ruleDictionary.pipe(
    HashSet.flatMap((rule) => HashSet.fromIterable(expandRule(rule))),
    RA.fromIterable,
    RA.sortBy(Order.mapInput(Order.string, (x) => x[0])),
    HashMap.fromIterable,
  );

  const searchRule = yield* RcMap.make({
    lookup: (key: string) =>
      Effect.sync(() => HashMap.filter(expandedRules, (_, k) => k.startsWith(key))).pipe(
        Effect.map((x) =>
          pipe(
            RA.fromIterable(x),
            RA.map((x) => x[1]),
          ),
        ),
      ),
  });

  const findRulesByKey = (key: string) => RcMap.get(searchRule, key);
  const checkKeys = RcMap.keys(searchRule);

  return yield* Effect.succeed({
    themeKeys,
    checkKeys,
    findRulesByKey,
    screenVariants,
    colors,
    expandedRules,
    opacities,
    variants,
    rules,
    ruleDictionary,
    expandRule,
    getRulePatternsDictionary,
  });

  // function getRuleExpansions(rule: TwinDslModels.TwinRuleNode) {
  //   TwinDslModels.TwinRuleNode.$match({
  //     ThemedKey: (rule) => {
  //       const list = rule.pattern.split('|');
  //       if (rule.themeSection === 'colors') {
  //         const colors = themeFlattenValuesCache.get(tw.theme('colors') ?? {});
  //         const flatten = flattenColorPalette(colors);
  //       }
  //     },
  //     UnKeyed: (rule) => {},
  //   });
  // }
});

// const getCachedThemeValue = (tw: InternalTwFn, themeKey: string) => {};

const getThemeVariants = (
  config: InternalTwinConfig,
): HashSet.HashSet<TwinDslModels.TwinVariantNode> =>
  HashSet.fromIterable(config.variants).pipe(
    HashSet.map((variant): TwinDslModels.TwinVariantNode => {
      if (typeof variant[1] === 'function') {
        return TwinDslModels.TwinVariantNode.Resolver({ pattern: variant[0], value: variant[1] });
      }
      return TwinDslModels.TwinVariantNode.Literal({ pattern: variant[0], value: variant[1] });
    }),
  );

const getThemeRules = (config: InternalTwinConfig): HashSet.HashSet<TwinDslModels.TwinRuleNode> =>
  HashSet.fromIterable(config.rules).pipe(
    HashSet.map((rule): TwinDslModels.TwinRuleNode => {
      if (typeof rule[1] === 'string') {
        return TwinDslModels.TwinRuleNode.ThemedKey({
          pattern: rule[0],
          meta: rule[3] ?? DEFAULT_RULE_META,
          resolver: rule[2],
          themeSection: rule[1] as Data.TaggedEnum.Value<
            TwinDslModels.TwinRuleNode,
            'ThemedKey'
          >['themeSection'],
        });
      }
      return TwinDslModels.TwinRuleNode.UnKeyed({
        pattern: rule[0],
        meta: rule[3] ?? DEFAULT_RULE_META,
        resolver: rule[2],
      });
    }),
  );

const getThemeScreenEntries = (config: InternalTwinConfig) =>
  HashMap.fromIterable(Object.entries(config.theme.screens ?? {})).pipe(
    HashMap.union(HashMap.fromIterable(Object.entries(config.theme.extend?.screens ?? {}))),
  );

type SectionKeysSet = ReturnType<typeof getThemeSectionKeys>;
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
