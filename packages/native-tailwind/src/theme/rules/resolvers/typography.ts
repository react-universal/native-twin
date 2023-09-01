import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const textAlignThemeRules: Rule<BaseTheme>[] = [['text-', { themeAlias: 'textAlign' }]];

export const lineHeightThemeRules: Rule<BaseTheme>[] = [
  ['leading-', { themeAlias: 'lineHeight' }],
];

export const fontWeightThemeRules: Rule<BaseTheme>[] = [
  ['font-', { themeAlias: 'fontWeight' }],
];

export const fontSizeThemeRules: Rule<BaseTheme>[] = [
  [
    'text-',
    {
      themeAlias: 'fontSize',

      resolver(match, ctx) {
        const value = ctx.theme('fontSize', match.$$);
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
    },
  ],
];
