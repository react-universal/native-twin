import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const colorThemeRules: Rule<BaseTheme>[] = [
  [
    'bg-',
    {
      themeAlias: 'colors',
      propertyAlias: 'backgroundColor',
    },
  ],
  [
    'text-',
    {
      themeAlias: 'colors',
      propertyAlias: 'color',
    },
  ],
];
