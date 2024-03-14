import { matchThemeColor } from '@native-twin/core';
import type { Rule } from '@native-twin/core';
import { TailwindPresetTheme } from '../types/theme.types';

export const backgroundRules: Rule<TailwindPresetTheme>[] = [
  matchThemeColor('bg-', 'backgroundColor'),
];
