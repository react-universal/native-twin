import { matchThemeValue } from '@native-twin/native-twin';
import type { Rule } from '@native-twin/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const spacingRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('p', 'spacing', 'padding', {
    canBeNegative: true,
    feature: 'edges',
    prefix: 'padding',
  }),
  matchThemeValue('m', 'spacing', 'margin', {
    canBeNegative: true,
    feature: 'edges',
    prefix: 'margin',
  }),
  matchThemeValue('gap-', 'spacing', 'gap', {
    feature: 'gap',
    prefix: 'gap',
  }),
];
