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
        fontSize: value,
      };
    },
  ],
];
