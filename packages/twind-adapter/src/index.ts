import {
  twind,
  virtual,
  tx as tx$,
  injectGlobal as injectGlobal$,
  cx as cx$,
  defineConfig,
} from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import twindPresetReactNative from './presets/preset-react-native';
import { rotateRules } from './rules/rotate';
import { shadowRules } from './rules/shadow';
import { skewRules } from './rules/skew';
import { translateRules } from './rules/translate';
import type { CustomConfig } from './types';

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

export function initialize /* #__PURE__ */(
  theme: Exclude<CustomConfig['theme'], undefined> = {},
) {
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

export type TwindManager = ReturnType<typeof initialize>;
