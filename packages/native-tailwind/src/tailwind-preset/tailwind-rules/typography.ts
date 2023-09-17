import { matchThemeColor, matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';

export const fontThemeRules: Rule<__Theme__>[] = [
  [
    'text-',
    'fontSize',
    (match, ctx) => {
      if (match.segment.type == 'arbitrary') {
        return {
          fontSize: match.segment.value,
        };
      }
      let value = ctx.theme('fontSize', match.segment.value);
      if (!value) return;
      if (Array.isArray(value)) {
        const [size, leading] = value as string[];
        if (size && leading) {
          return {
            fontSize: size,
            lineHeight: leading,
          };
        }
        if (size) value = size;
      }
      return {
        fontSize: value,
      };
    },
  ],
  matchThemeValue('font-', 'fontWeight', 'fontWeight'),
  matchThemeValue('font-', 'fontFamily', 'fontFamily'),
  matchThemeValue('leading-', 'lineHeight', 'lineHeight'),
  matchThemeColor('decoration-', 'textDecorationColor'),
  matchThemeValue('decoration-', 'textDecorationStyle', 'textDecorationStyle'),
  matchThemeValue('capitalize|uppercase|lowercase', 'textTransform', 'textTransform'),
];
