import { matchThemeColor } from '@native-twin/native-twin';
import type { Rule } from '@native-twin/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const backgroundRules: Rule<TailwindPresetTheme>[] = [
  matchThemeColor('bg-', 'backgroundColor'),
];
