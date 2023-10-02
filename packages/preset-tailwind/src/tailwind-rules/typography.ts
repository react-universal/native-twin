import { matchThemeColor, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import type { __Theme__ } from '@universal-labs/native-twin';

export const fontThemeRules: Rule<__Theme__>[] = [
  matchThemeValue('text-', 'fontSize', 'fontSize'),
  matchThemeColor('text-', 'color'),
  matchThemeValue('font-', 'fontWeight', 'fontWeight'),
  matchThemeValue('font-', 'fontFamily', 'fontFamily'),
  matchThemeValue('leading-', 'lineHeight', 'lineHeight'),
  matchThemeColor('decoration-', 'textDecorationColor'),
  matchThemeValue('decoration-', 'textDecorationStyle', 'textDecorationStyle'),
  matchThemeValue('capitalize|uppercase|lowercase', 'textTransform', 'textTransform'),
  matchThemeValue('italic|normal', 'fontStyle', 'fontStyle'),
];
