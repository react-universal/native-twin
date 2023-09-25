import { matchThemeColor, matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';

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
