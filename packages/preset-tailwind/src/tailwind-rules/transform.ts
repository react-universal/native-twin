import { matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import type { __Theme__ } from '@universal-labs/native-twin';

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
