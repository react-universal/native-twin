import { matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
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
