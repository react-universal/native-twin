import {
  twind,
  virtual,
  tx as tx$,
  injectGlobal as injectGlobal$,
  cx as cx$,
  defineConfig,
} from '@twind/core';
import presetTailwind, { TailwindTheme } from '@twind/preset-tailwind';
import type { CustomConfig } from '../types';
import twindPresetReactNative from './presets/preset-react-native';
import { rotateRules } from './rules/rotate';
import { shadowRules } from './rules/shadow';
import { skewRules } from './rules/skew';
import { translateRules } from './rules/translate';

export { hash, style as stylesGenerator, css as injectCss } from '@twind/core';

const defaultConfig = defineConfig({
  preflight: false,
  darkMode: 'class',
  ignorelist: [
    'grid-(.*)',
    'col-(.*)',
    'row-(.*)',
    'auto-cols-(.*)',
    'auto-rows-(.*)',
    'transition-(.*)',
    'duration-(.*)',
    'ease-(.*)',
    'delay-(.*)',
    'animate-(.*)',
  ],
  presets: [presetTailwind({ disablePreflight: true }), twindPresetReactNative()],
  rules: [...translateRules, ...rotateRules, ...shadowRules, ...skewRules],
});

function initialize /* #__PURE__ */(theme: Exclude<CustomConfig['theme'], undefined> = {}) {
  const tw = twind(
    {
      ...defaultConfig,
      theme: {
        ...defaultConfig?.theme,
        extend: {
          ...defaultConfig?.theme?.extend,
          ...theme,
        },
      },
    },
    virtual(false),
  );
  const tx = tx$.bind(tw);
  const injectGlobal = injectGlobal$.bind(tw);
  const cx = cx$.bind(tw);
  return {
    tw,
    tx,
    injectGlobal,
    cx,
  };
}

export class Tailwind {
  instance: TwindManager;
  constructor(userTheme: Exclude<CustomConfig['theme'], undefined> = {}) {
    this.instance = initialize(userTheme);
  }

  parseAndInject(classNames: string) {
    const restore = this.instance.tw.snapshot();
    const generated = this.instance.tx(classNames);
    const target = [...this.instance.tw.target];
    restore();
    return {
      generated,
      target,
    };
  }
}

export type TwindManager = ReturnType<typeof initialize>;

export type { TailwindTheme };

export type {
  AutocompleteItem,
  Twind,
  BaseTheme,
  MaybeArray,
  MatchResult,
  AutocompleteContext,
  TwindConfig,
  TwindUserConfig,
  ScreenValue,
  ParsedDevRule,
  ExtractThemes,
  Preset,
  ExtractUserTheme,
  ThemeFunction,
  MaybeColorValue,
  Rule,
  Variant,
} from '@twind/core';
export { asArray, stringify, mql, getAutocompleteProvider, parse } from '@twind/core';
