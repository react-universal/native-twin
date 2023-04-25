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
} from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import presetReactNativeFlex from '../presets/flex';
import presetRemToPx from '../presets/rem-to-px';
import { translateRules } from '../rules/translate';
import { CustomConfig } from '../types';

export { escape };
export let tw = /* #__PURE__ */ twind(
  {
    ignorelist: [''],
    preflight: false,
    presets: [
      presetTailwind({ disablePreflight: true }),
      presetRemToPx({ baseRem: 16 }),
      presetReactNativeFlex(),
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
export { stringify };

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
        presetRemToPx({ baseRem }),
        presetReactNativeFlex(),
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
};
