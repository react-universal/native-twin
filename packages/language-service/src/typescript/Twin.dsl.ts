import { flattenColorPalette, keysOf } from '@native-twin/helpers';
import type { Data } from 'effect';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import { globalValue } from 'effect/GlobalValue';
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Order from 'effect/Order';
import * as SortedSet from 'effect/SortedSet';
import type { InternalTwFn, InternalTwinConfig } from '../models/twin/native-twin.types';
import { DEFAULT_RULE_META } from '../utils/constants.utils';
import { TwinDslModels } from './models/TwinDsl.models';

const themeFlattenValuesCache = globalValue(
  Symbol.for('native-twin/stores/theme-values'),
  () => new WeakMap<object, any>(),
);

export const createTwinDSL = Effect.fn(function* (tw: InternalTwFn) {
  const twinConfig = tw.config;
  const themeKeys = getThemeSectionKeys(twinConfig);
  const screenVariants = getThemeScreenEntries(twinConfig);
  const colors = getThemeColorPalette(twinConfig);
  const opacities = getThemeOpacities(twinConfig);
  const variants = getThemeVariants(twinConfig);
  const rules = getThemeRules(twinConfig);

  const rulesByPattern = rules.pipe;

  return yield* Effect.succeed({ themeKeys, screenVariants, colors, opacities, variants, rules });

  function getRuleExpansions(rule: TwinDslModels.TwinRuleNode) {
    TwinDslModels.TwinRuleNode.$match({
      ThemedKey: (rule) => {
        const list = rule.pattern.split('|');
        if (rule.themeSection === 'colors') {
          const colors = themeFlattenValuesCache.get(tw.theme('colors') ?? {});
          const flatten = flattenColorPalette(colors);
        }
      },
      UnKeyed: (rule) => {},
    });
  }
});

const getCachedThemeValue = (tw: InternalTwFn, themeKey: string) => {};

const getRulePatternsDictionary = (
  themeKeys: SectionKeysSet,
  rules: HashSet.HashSet<TwinDslModels.TwinRuleNode>,
) => {
  rules.pipe(
    HashSet.flatMap((rule) => {
      return HashSet.make(rule);
    }),
  );
};

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
