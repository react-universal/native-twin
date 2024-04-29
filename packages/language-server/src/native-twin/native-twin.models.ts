import * as Context from 'effect/Context';
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
import { createTwinStore } from './utils/native-twin.utils';

export type InternalTwinConfig = TailwindConfig<__Theme__ & TailwindPresetTheme>;
export type InternalTwFn = RuntimeTW<__Theme__ & TailwindPresetTheme, SheetEntry[]>;
export type InternalTwinThemeContext = ThemeContext<__Theme__ & TailwindPresetTheme>;

export interface TwinStore {
  twinVariants: HashSet.HashSet<TwinVariantCompletion>;
  twinRules: HashSet.HashSet<TwinRuleWithCompletion>;
}

export class NativeTwinManagerService extends Context.Tag('NativeTwinManager')<
  NativeTwinManagerService,
  NativeTwinManager
>() {}

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
