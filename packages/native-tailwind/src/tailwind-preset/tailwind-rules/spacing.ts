import { resolveThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';

export const spacingRules: Rule<__Theme__>[] = [
  resolveThemeValue('-?p-', 'spacing', 'padding', {
    canBeNegative: true,
    feature: 'edges',
    baseProperty: 'padding',
  }),
  resolveThemeValue('m', 'spacing', 'padding', {
    canBeNegative: true,
    feature: 'edges',
    baseProperty: 'padding',
  }),
];
