import { matchThemeValue } from '@native-twin/core';
import type { Rule } from '@native-twin/core';
import { TailwindPresetTheme } from '../types/theme.types';

export const translateRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('translate-', 'translate', 'transform', {
    feature: 'transform-2d',
    prefix: 'translate',
  }),
  matchThemeValue('rotate-', 'rotate', 'transform', {
    feature: 'transform-2d',
    prefix: 'rotate',
  }),
  matchThemeValue('skew-', 'skew', 'transform', {
    feature: 'transform-2d',
    prefix: 'skew',
  }),
  matchThemeValue('scale-', 'scale', 'transform', {
    feature: 'transform-2d',
    prefix: 'scale',
  }),
];
