import { matchThemeValue } from '@native-twin/native-twin';
import type { Rule } from '@native-twin/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const boxShadowRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('shadow-', 'boxShadow', 'shadowRadius'),
];
