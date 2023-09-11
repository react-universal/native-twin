import { resolveColorValue, resolveThemeValue } from '../../theme/rule-resolver';
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
  resolveColorValue('border-', 'borderColor'),
  resolveThemeValue('border-', 'borderWidth', 'border-width', {
    canBeNegative: false,
    feature: 'edges',
  }),
  resolveThemeValue('rounded-', 'borderRadius', 'borderRadius', {
    canBeNegative: false,
    feature: 'corners',
  }),
];
