import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as ReadonlyArray from 'effect/Array';
import { __Theme__ } from '@native-twin/core';
import * as NativeTwinResource from './native-twin.resource';
import { createRuleClassNames, createRuleCompositions } from './native-twin.rules';
import { TwinRuleWithCompletion, TwinVariantCompletion } from '../types/native-twin.types';

export interface TwinStore {
  twinVariants: HashSet.HashSet<TwinVariantCompletion>;
  twinRules: HashSet.HashSet<TwinRuleWithCompletion>;
}

export const createTwinStore = (
  nativeTwinHandler: NativeTwinResource.NativeTwinHandler,
): TwinStore => {
  const theme = { ...nativeTwinHandler.tw.config.theme };
  const themeSections = new Set(Object.keys({ ...theme, ...theme.extend }).sort());
  // const twinRules = HashSet.empty<TwinRuleWithCompletion>();
  themeSections.delete('theme');
  themeSections.delete('extend');
  let currentIndex = 0;
  // let position = 0;
  const currentConfig = nativeTwinHandler.config;
  const variants = Object.entries({
    ...currentConfig.theme.screens,
    ...currentConfig.theme.extend?.screens,
  });
  const colorPalette = {
    ...nativeTwinHandler.context.colors,
    ...nativeTwinHandler.config.theme.extend?.colors,
  };

  const twinThemeRules = ReadonlyArray.fromIterable(nativeTwinHandler.tw.config.rules);

  const flattenRules = ReadonlyArray.flatMap(twinThemeRules, (rule) => {
    return createRuleCompositions(rule).flatMap((composition) => {
      const values =
        composition.parts.themeSection === 'colors'
          ? colorPalette
          : nativeTwinHandler.context.theme(
              composition.parts.themeSection as keyof __Theme__,
            ) ?? {};
      return createRuleClassNames(values, composition.composition, composition.parts).map(
        (className): TwinRuleWithCompletion => ({
          completion: className,
          composition: composition.composition,
          rule: composition.parts,
          order: currentIndex++,
        }),
      );
    });
  });

  const composedTwinRules: HashSet.HashSet<TwinRuleWithCompletion> = pipe(
    flattenRules,
    // ReadonlyArray.fromIterable(nativeTwinHandler.tw.config.rules),
    // ReadonlyArray.map((x) => createRuleCompositions(x)),
    // ReadonlyArray.flatten,
    // ReadonlyArray.map((x) => {
    //   const values =
    //     x.parts.themeSection === 'colors'
    //       ? colorPalette
    //       : nativeTwinHandler.context.theme(x.parts.themeSection as keyof __Theme__) ??
    //         {};
    //   return createRuleClassNames(values, x.composition, x.parts).map(
    //     (className): TwinRuleWithCompletion => ({
    //       completion: className,
    //       composition: x.composition,
    //       rule: x.parts,
    //     }),
    //   );
    // }),
    // ReadonlyArray.flatten,
    ReadonlyArray.sortBy((x, y) => (x.order > y.order ? 1 : -1)),
    HashSet.fromIterable,
  );

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

  return {
    twinRules: composedTwinRules,
    twinVariants,
  };
};
