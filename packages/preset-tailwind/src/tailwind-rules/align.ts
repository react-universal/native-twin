import type { Rule } from '@universal-labs/native-twin';
import { matchThemeValue } from '@universal-labs/native-twin';

export const verticalAlignsRules: Rule[] = [
  matchThemeValue('align-', 'verticalAlign', 'verticalAlign', {
    canBeNegative: false,
    feature: 'default',
  }),
];

export const textAlignsRules: Rule[] = [matchThemeValue('text-', 'textAlign', 'textAlign')];
