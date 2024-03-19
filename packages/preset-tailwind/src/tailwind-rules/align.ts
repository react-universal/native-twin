import type { Rule } from '@native-twin/native-twin';
import { matchThemeValue } from '@native-twin/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const verticalAlignsRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('align-', 'verticalAlign', 'verticalAlign', {
    canBeNegative: false,
    feature: 'default',
  }),
];

export const textAlignsRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('text-', 'textAlign', 'textAlign'),
];
