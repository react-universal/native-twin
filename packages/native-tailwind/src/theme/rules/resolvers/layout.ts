import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const displayThemeRules: Rule<BaseTheme>[] = [
  [
    '(hidden|flex)',
    {
      themeAlias: 'display',
      resolver: (match, context) => {
        return {
          display: context.theme('display', match[0]),
        };
      },
    },
  ],
];
