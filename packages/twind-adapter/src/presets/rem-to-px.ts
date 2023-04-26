import type { Preset } from '@twind/core';
import type { RemToPxBaseOptions } from './types';

const transformLineHeight = (rule?: string) => {
  return rule?.replace(/(line-height:)(1)/g, (match, p1, p2) => {
    if (Number(p2) !== 1) return match;
    return `${p1}${Number(p2) === 1 ? 0 : p2}`;
  });
};

export default function presetRemToPx({ baseRem = 16 }: RemToPxBaseOptions): Preset {
  return {
    finalize(rule) {
      if (rule.n?.startsWith('text')) {
        rule.d = transformLineHeight(rule.d);
      }
      return {
        ...rule,
        // d: the CSS declaration body
        // Based on https://github.com/TheDutchCoder/postcss-rem-to-px/blob/main/index.js
        d: rule.d?.replace(/"[^"]+"|'[^']+'|url\([^)]+\)|(-?\d*\.?\d+)rem/g, (match, p1) => {
          if (p1 === undefined) return match;
          return `${p1 * baseRem}${p1 == 0 ? '' : 'px'}`;
        }),
      };
    },
  };
}
