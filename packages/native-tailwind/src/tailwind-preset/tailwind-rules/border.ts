import { matchThemeColor, matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';
import { globalKeywords } from '../../utils/mappings';

export const borderStyles = [
  'solid',
  'dashed',
  'dotted',
  'double',
  'hidden',
  'none',
  'groove',
  'ridge',
  'inset',
  'outset',
  ...globalKeywords,
];

export const borderRules: Rule<__Theme__>[] = [
  matchThemeColor('border-', 'borderColor', {
    feature: 'edges',
    prefix: 'border',
    suffix: '-color',
  }),
  matchThemeValue('border-', 'borderWidth', 'borderWidth', {
    feature: 'edges',
    prefix: 'border',
    suffix: '-width',
  }),
  matchThemeValue('rounded-', 'borderRadius', 'borderRadius', {
    feature: 'corners',
  }),
];
