import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const typographyThemeRules: Rule<BaseTheme>[] = [
  [
    /text-(center|left|right|unset|end|inherit|initial|match-parent|revert|revert-layer)/,
    ({ 1: $1 }) => {
      if (!$1) return null;
      return {
        textAlign: $1,
      };
    },
  ],
  ['leading-', { themeAlias: 'lineHeight' }],
  ['font-', { themeAlias: 'fontWeight' }],
  [
    /^text-(.+)$/,
    ({ 1: $1 }, ctx) => {
      const value = ctx.theme('fontSize', $1);
      if (!value) return null;
      if (typeof value[1] == 'string') {
        return {
          'font-size': value[0]!,
          'line-height': value[1]!,
        };
      }
      return {
        'font-size': value[0]!,
        'line-height': value[1].lineHeight,
        'font-weight': value[1].fontWeight,
        'letter-spacing': value[1].letterSpacing,
      };
    },
  ],
];
