import type { Rule } from '@native-twin/core';
import { matchThemeValue } from '@native-twin/core';
import { TailwindPresetTheme } from '../types/theme.types';

export const verticalAlignsRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('align-', 'verticalAlign', 'verticalAlign', {
    canBeNegative: false,
    feature: 'default',
    prefix: '',
    styleProperty: 'verticalAlign',
    suffix: '',
    support: [],
  }),
];

export const textAlignsRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('text-', 'textAlign', 'textAlign'),
];
