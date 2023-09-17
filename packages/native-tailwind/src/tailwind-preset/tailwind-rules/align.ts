import { matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';

export const verticalAlignsRules: Rule[] = [
  matchThemeValue('align-', '', 'verticalAlign', {
    canBeNegative: false,
    feature: 'default',
  }),
];

export const textAlignsRules: Rule[] = [matchThemeValue('text-', 'textAlign', 'textAlign')];
