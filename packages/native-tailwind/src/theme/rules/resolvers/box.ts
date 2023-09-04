import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const boxThemeRules: Rule<BaseTheme>[] = [
  [/(?:box-)decoration-(slice|clone)?/, { themeAlias: 'boxDecorationBreak' }],
  [
    /^box-(border|content)/,
    ({ 1: $1 }) => ({
      boxSizing: `${$1}-box`,
    }),
  ],
];
