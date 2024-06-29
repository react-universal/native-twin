import * as ReadonlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import type { __Theme__ } from '@native-twin/core';
import type { TWScreenValueConfig } from '@native-twin/css';
import { ColorsRecord, asArray, toColorValue } from '@native-twin/helpers';
import { createRuleClassNames, createRuleCompositions } from '../native-twin.rules';
import type {
  TwinRuleCompletion,
  TwinVariantCompletion,
  InternalTwFn,
  InternalTwinConfig,
  InternalTwinThemeContext,
  TwinStore,
} from '../native-twin.types';

export const createTwinStore = (nativeTwinHandler: {
  tw: InternalTwFn;
  context: InternalTwinThemeContext;
  config: InternalTwinConfig;
}): TwinStore => {
  const theme = { ...nativeTwinHandler.tw.config.theme };
  const themeSections = new Set(Object.keys({ ...theme, ...theme.extend }).sort());
  // const twinRules = HashSet.empty<TwinRuleWithCompletion>();
  themeSections.delete('theme');
  themeSections.delete('extend');
  let currentIndex = 0;
  const currentConfig = nativeTwinHandler.config;
  const variants = Object.entries({
    ...currentConfig.theme.screens,
    ...currentConfig.theme.extend?.screens,
  });
  const colorPalette = {
    ...nativeTwinHandler.context.colors,
    ...nativeTwinHandler.config.theme.extend?.colors,
  };

  const twinVariants = HashSet.fromIterable(variants).pipe(
    HashSet.map((variant): TwinVariantCompletion => {
      return {
        kind: 'variant',
        name: `${variant[0]}:`,
        index: currentIndex++,
        position: currentIndex,
      } as const;
    }),
  );

  const twinThemeRules = ReadonlyArray.fromIterable(nativeTwinHandler.tw.config.rules);
  const opacities = Object.entries(nativeTwinHandler.context.theme('opacity') ?? {});
  const flattenRules = ReadonlyArray.flatMap(twinThemeRules, (rule) => {
    return createRuleCompositions(rule).flatMap((composition) => {
      let values: Record<string, TWScreenValueConfig> | ColorsRecord = {};
      if (composition.parts.themeSection === 'colors') {
        values = colorPalette;
      } else {
        values =
          nativeTwinHandler.context.theme(
            composition.parts.themeSection as keyof __Theme__,
          ) ?? {};
      }
      return pipe(
        createRuleClassNames(values, composition.composition, composition.parts),
        ReadonlyArray.flatMap((className): TwinRuleCompletion[] => {
          const insertRule: TwinRuleCompletion = {
            kind: 'rule',
            completion: className,
            composition: composition.composition,
            rule: composition.parts,
            order: currentIndex++,
          };

          if (insertRule.rule.themeSection === 'colors') {
            const newColors = opacities.map((x) => {
              const completion = {
                ...insertRule.completion,
                className: `${insertRule.completion.className}/${x[0]}`,
                declarationValue: toColorValue(insertRule.completion.declarationValue, {
                  opacityValue: x[1],
                }),
              };
              return {
                ...insertRule,
                completion,
                order: currentIndex++,
              };
            });
            return [...newColors, insertRule];
          }
          return asArray(insertRule);
        }),
      );
    });
  });

  const composedTwinRules: HashSet.HashSet<TwinRuleCompletion> = pipe(
    flattenRules,
    ReadonlyArray.sortBy((x, y) => (x.order > y.order ? 1 : -1)),
    HashSet.fromIterable,
  );

  return {
    twinRules: composedTwinRules,
    twinVariants,
  };
};
