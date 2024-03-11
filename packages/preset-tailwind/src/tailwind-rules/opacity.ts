import { matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const opacityRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('opacity-', 'opacity', 'opacity'),
];
