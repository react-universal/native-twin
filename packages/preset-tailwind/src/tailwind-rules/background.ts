import { matchThemeColor } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const backgroundRules: Rule<TailwindPresetTheme>[] = [
  matchThemeColor('bg-', 'backgroundColor'),
];
