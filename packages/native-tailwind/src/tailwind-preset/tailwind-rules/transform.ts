import { matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';

export const translateRules: Rule<__Theme__>[] = [
  matchThemeValue('translate-', 'translate', 'transform', {
    feature: 'transform-2d',
    prefix: 'translate',
  }),
  matchThemeValue('rotate-', 'rotate', 'transform', {
    feature: 'transform-2d',
    prefix: 'rotate',
  }),
  matchThemeValue('skew-', 'skew', 'transform', {
    feature: 'transform-2d',
    prefix: 'skew',
  }),
  matchThemeValue('scale-', 'scale', 'transform', {
    feature: 'transform-2d',
    prefix: 'scale',
  }),
];
