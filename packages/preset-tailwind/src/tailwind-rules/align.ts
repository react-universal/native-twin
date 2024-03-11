import type { Rule } from '@universal-labs/native-twin';
import { matchThemeValue } from '@universal-labs/native-twin';
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
