import { matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';

export const spacingRules: Rule<__Theme__>[] = [
  matchThemeValue('p', 'spacing', 'padding', {
    canBeNegative: true,
    feature: 'edges',
    prefix: 'padding',
  }),
  matchThemeValue('m', 'spacing', 'margin', {
    canBeNegative: true,
    feature: 'edges',
    prefix: 'margin',
  }),
  matchThemeValue('gap-', 'spacing', 'gap', {
    feature: 'xy',
    prefix: 'gap',
  }),
];
