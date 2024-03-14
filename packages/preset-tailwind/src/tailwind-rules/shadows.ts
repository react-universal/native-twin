import { matchThemeValue } from '@native-twin/core';
import type { Rule } from '@native-twin/core';
import { TailwindPresetTheme } from '../types/theme.types';

export const boxShadowRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('shadow-', 'boxShadow', 'shadowRadius'),
];
