import { matchThemeValue } from '@native-twin/native-twin';
import type { Rule } from '@native-twin/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const opacityRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('opacity-', 'opacity', 'opacity'),
];
