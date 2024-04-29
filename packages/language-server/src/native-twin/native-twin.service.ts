import * as ReadonlyArray from 'effect/Array';
import * as Context from 'effect/Context';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import {
  __Theme__,
  createTailwind,
  createThemeContext,
  defineConfig,
  RuntimeTW,
  TailwindConfig,
  ThemeContext,
} from '@native-twin/core';
import { createVirtualSheet, SheetEntry } from '@native-twin/css';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind/build/types/theme.types';
import {
  TwinRuleWithCompletion,
  TwinVariantCompletion,
} from '../types/native-twin.types';
import { requireJS } from '../utils/load-js';
import { createRuleClassNames, createRuleCompositions } from './native-twin.rules';

export type InternalTwinConfig = TailwindConfig<__Theme__ & TailwindPresetTheme>;
export type InternalTwFn = RuntimeTW<__Theme__ & TailwindPresetTheme, SheetEntry[]>;
export type InternalTwinThemeContext = ThemeContext<__Theme__ & TailwindPresetTheme>;

const defaultConfig = {
  content: [],
  theme: {},
  darkMode: 'class',
  ignorelist: [],
  mode: 'native',
  preflight: {},
  root: {
    rem: 16,
  },
  rules: [],
  variants: [],
} as InternalTwinConfig;

export class NativeTwinManager {
  tw: InternalTwFn;
  context: InternalTwinThemeContext;
  userConfig: InternalTwinConfig = defaultConfig;
  completions: TwinStore = {
    twinRules: HashSet.empty<TwinRuleWithCompletion>(),
    twinVariants: HashSet.empty<TwinVariantCompletion>(),
  };

  constructor() {
    this.tw = this.getNativeTwin();
    this.context = this.getContext();
  }

  loadUserFile(configFile: string) {
    this.userConfig = this.getUserConfig(configFile);
    this.tw = this.getNativeTwin();
    this.context = this.getContext();

    this.completions = createTwinStore({
      config: this.userConfig,
      context: this.context,
      tw: this.tw,
    });
  }

  private getContext() {
    return createThemeContext(this.userConfig);
  }

  private getNativeTwin() {
    return createTailwind(this.userConfig, createVirtualSheet());
  }

  private getUserConfig(filePath: string) {
    const file = requireJS(filePath);
    if (!file) {
      throw new Error('Cant resolve user config at path ' + filePath);
    }

    return defineConfig(file);
  }
}

export class NativeTwinManagerService extends Context.Tag('NativeTwinManager')<
  NativeTwinManagerService,
  NativeTwinManager
>() {}

export interface TwinStore {
  twinVariants: HashSet.HashSet<TwinVariantCompletion>;
  twinRules: HashSet.HashSet<TwinRuleWithCompletion>;
}

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
