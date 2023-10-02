import { matchThemeColor, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import type { __Theme__ } from '@universal-labs/native-twin';

export const borderRules: Rule<__Theme__>[] = [
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
