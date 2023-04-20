import {
  twind,
  virtual,
  tx as tx$,
  injectGlobal as injectGlobal$,
  keyframes as keyframes$,
  cx as cx$,
  stringify,
  Twind,
} from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import presetReactNativeFlex from './presets/flex';
import presetRemToPx from './presets/rem-to-px';

export let tw = /* #__PURE__ */ twind(
  {
    ignorelist: [''],
    preflight: false,
    presets: [
      presetTailwind({ disablePreflight: true }),
      presetRemToPx({ baseRem: 16 }),
      presetReactNativeFlex(),
    ],
    rules: [
      [
        '-?translate-x-(\\s*\\d+|\\[(.*)])',
        (match) => {
          const isNegative = match.input.startsWith('-');
          const hasArbitrary = match[2] !== undefined;
          return {
            transform: `translate(${isNegative ? '-' : ''}${
              hasArbitrary ? match[2] : `${match[1]}rem`
            })`,
          };
        },
      ],
      [
        '-?translate-y-(\\s*\\d+|\\[(.*)])',
        (match) => {
          const isNegative = match.input.startsWith('-');
          const hasArbitrary = match[2] !== undefined;
          return {
            transform: `translate(0, ${isNegative ? '-' : ''}${
              hasArbitrary ? match[2] : `${match[1]}rem`
            })`,
          };
        },
      ],
      [
        '-?translate-(\\s*\\d+|\\[(.*)])',
        (match) => {
          const isNegative = match.input.startsWith('-');
          const hasArbitrary = match[2] !== undefined;
          return {
            transform: `translate(${isNegative ? '-' : ''}${
              hasArbitrary ? match[2] : `${match[1]}rem`
            }, ${isNegative ? '-' : ''}${hasArbitrary ? match[2] : `${match[1]}rem`})`,
          };
        },
      ],
    ],
  },
  virtual(true),
);
export let tx = /* #__PURE__ */ tx$.bind(tw);
export let injectGlobal = /* #__PURE__ */ injectGlobal$.bind(tw);
export let keyframes = /* #__PURE__ */ keyframes$.bind(tw);
export let cx = /* #__PURE__ */ cx$.bind(tw);
export { stringify };

export const setTailwindConfig = (theme?: Twind['config']['theme']['extend']) => {
  // @ts-expect-error
  tw = twind(
    {
      ignorelist: [''],
      preflight: false,
      presets: [
        presetTailwind({ disablePreflight: true }),
        presetRemToPx({ baseRem: 16 }),
        presetReactNativeFlex(),
      ],
      theme: {
        ...tw.config.theme,
        extend: {
          ...tw.config.theme.extend,
          ...theme,
        },
      },
      rules: tw.config.rules,
    },
    virtual(true),
  );
  tx = /* #__PURE__ */ tx$.bind(tw);
  injectGlobal = /* #__PURE__ */ injectGlobal$.bind(tw);
  keyframes = /* #__PURE__ */ keyframes$.bind(tw);
  cx = /* #__PURE__ */ cx$.bind(tw);
};
