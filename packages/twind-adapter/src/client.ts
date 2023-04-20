import {
  twind,
  virtual,
  tx as tx$,
  injectGlobal as injectGlobal$,
  keyframes as keyframes$,
  cx as cx$,
} from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import presetReactNativeFlex from './presets/flex';
import presetRemToPx from './presets/rem-to-px';

export const tw = /* #__PURE__ */ twind(
  {
    preflight: false,
    ignorelist: [''],
    presets: [
      presetTailwind({ disablePreflight: true }),
      presetRemToPx({ baseRem: 16 }),
      presetReactNativeFlex(),
    ],
  },
  virtual(true),
);
export const tx = /* #__PURE__ */ tx$.bind(tw);
export const injectGlobal = /* #__PURE__ */ injectGlobal$.bind(tw);
export const keyframes = /* #__PURE__ */ keyframes$.bind(tw);
export const cx = /* #__PURE__ */ cx$.bind(tw);
