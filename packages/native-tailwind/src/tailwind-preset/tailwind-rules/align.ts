import type { CSSProperties } from 'react';
import type { Rule } from '../../types/config.types';
import { globalKeywords } from '../../utils/mappings';

const verticalAlignAlias: Record<string, string> = {
  mid: 'middle',
  base: 'baseline',
  btm: 'bottom',
  baseline: 'baseline',
  top: 'top',
  start: 'top',
  middle: 'middle',
  bottom: 'bottom',
  end: 'bottom',
  'text-top': 'text-top',
  'text-bottom': 'text-bottom',
  sub: 'sub',
  super: 'super',
  ...Object.fromEntries(globalKeywords.map((x) => [x, x])),
};

export const verticalAlignsRules: Rule[] = [
  [
    'align-',
    (following) => {
      if (following in verticalAlignAlias) {
        return {
          verticalAlign: following,
        };
      }
    },
  ],
];

const textAligns = ['center', 'left', 'right', 'justify', 'start', 'end'];
export const textAlignsRules: Rule[] = [
  [
    'text-',
    (following) => {
      if (textAligns.includes(following)) {
        return {
          textAlign: following as CSSProperties['textAlign'],
        };
      }
    },
  ],
];
