import {
  twind,
  virtual,
  tx as tx$,
  injectGlobal as injectGlobal$,
  keyframes as keyframes$,
  cx as cx$,
  stringify,
  parse as parse$,
  escape,
  inline as inline$,
  shortcut as shortcut$,
  style,
  hash,
} from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import twindPresetReactNative from './presets/preset-react-native';
import { translateRules } from './rules/translate';
import type { CustomConfig } from './types';

export let tw = /* #__PURE__ */ twind(
  {
    ignorelist: [''],
    preflight: false,
    presets: [
      presetTailwind({ disablePreflight: true }),
      twindPresetReactNative({ baseRem: 16 }),
    ],
    hash: undefined,
    stringify: (x) => stringify(x),
    rules: [...translateRules],
  },
  virtual(true),
);

export let tx = /* #__PURE__ */ tx$.bind(tw);
export let injectGlobal = /* #__PURE__ */ injectGlobal$.bind(tw);
export let keyframes = /* #__PURE__ */ keyframes$.bind(tw);
export let cx = /* #__PURE__ */ cx$.bind(tw);
export let parse = /* #__PURE__ */ parse$.bind(tw);
export let inline = /* #__PURE__ */ inline$.bind(tw);
export let shortcut = /* #__PURE__ */ shortcut$.bind(tw);

export { escape };
export { stringify };
export { virtual as virtualStylesheet };
export { style, hash };
export { twindPresetReactNative };
export const setTailwindConfig = (
  theme: Exclude<CustomConfig['theme'], undefined>,
  baseRem = 16,
) => {
  // @ts-expect-error
  tw = twind(
    {
      ignorelist: [''],
      preflight: false,
      presets: [
        presetTailwind({ disablePreflight: true }),
        twindPresetReactNative({ baseRem }),
      ],
      rules: [...translateRules],
      hash: undefined,
      theme: {
        extend: {
          ...theme,
        },
      },
    },
    virtual(true),
  );
  tx = /* #__PURE__ */ tx$.bind(tw);
  injectGlobal = /* #__PURE__ */ injectGlobal$.bind(tw);
  keyframes = /* #__PURE__ */ keyframes$.bind(tw);
  cx = /* #__PURE__ */ cx$.bind(tw);
  parse = /* #__PURE__ */ parse$.bind(tw);
  inline = /* #__PURE__ */ inline$.bind(tw);
  shortcut = /* #__PURE__ */ shortcut$.bind(tw);
};
