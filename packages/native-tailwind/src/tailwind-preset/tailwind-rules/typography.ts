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
      if (!value) return;
      return {
        fontSize: value as any,
      };
    },
  ],
  matchThemeColor('text-', 'color'),
  matchThemeValue('font-', 'fontWeight', 'fontWeight'),
  matchThemeValue('font-', 'fontFamily', 'fontFamily'),
  matchThemeValue('leading-', 'lineHeight', 'lineHeight'),
  matchThemeColor('decoration-', 'textDecorationColor'),
  matchThemeValue('decoration-', 'textDecorationStyle', 'textDecorationStyle'),
  matchThemeValue('capitalize|uppercase|lowercase', 'textTransform', 'textTransform'),
  matchThemeValue('italic|normal', 'fontStyle', 'fontStyle'),
];
