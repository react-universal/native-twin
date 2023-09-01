import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const aspectRatioThemeRules: Rule<BaseTheme>[] = [
  [
    /aspect-(video|square)/,
    {
      themeAlias: 'aspectRatio',
      resolver: ({ 1: $1 }, context) => {
        if (!$1) return null;
        return {
          aspectRatio: context.theme('aspectRatio', $1),
        };
      },
    },
  ],
];
