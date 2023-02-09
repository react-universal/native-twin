import {
  twind,
  virtual,
  tx as tx$,
  injectGlobal as injectGlobal$,
  keyframes as keyframes$,
  cx as cx$,
} from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';
import presetReactNativeFlex from './preset/native/flex.preset';
import presetRemToPx from './preset/remToPx.preset';

export const tw = /* #__PURE__ */ twind(
  {
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

// import { setup, virtual } from '@twind/core';
// import presetTailwind from '@twind/preset-tailwind';
// import presetRemToPx from '../preset/remToPx.preset';

// const sheet = virtual(true);
// const tw = setup(
//   {
//     presets: [presetTailwind({ disablePreflight: true }), presetRemToPx({ baseRem: 16 })],
//   },
//   sheet,
// );

// export default tw;
// export { sheet };
