import { matchThemeColor, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const borderRules: Rule<TailwindPresetTheme>[] = [
  matchThemeColor('border-', 'borderColor', {
    feature: 'edges',
    prefix: 'border',
    suffix: 'Color',
  }),
  matchThemeValue('border-', 'borderStyle', 'borderStyle'),
  matchThemeValue('border-', 'borderWidth', 'borderWidth', {
    feature: 'edges',
    prefix: 'border',
    suffix: 'Width',
  }),
  matchThemeValue('rounded-', 'borderRadius', 'borderRadius', {
    feature: 'corners',
    prefix: 'border',
    suffix: 'Radius',
  }),
];
