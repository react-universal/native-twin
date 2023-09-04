import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const paddingThemeRules: Rule<BaseTheme>[] = [
  [
    /^p([xytrbl]?)-?(.*)/,
    {
      themeAlias: 'padding',
      expansion: {
        kind: 'edges',
        prefix: 'padding',
        suffix: '',
      },
    },
  ],
];

export const marginThemeRules: Rule<BaseTheme>[] = [
  [
    /-?m([xytrbl]?)-?(.*)/,

    {
      themeAlias: 'margin',
      canBeNegative: true,
      expansion: {
        kind: 'edges',
        prefix: 'margin',
        suffix: '',
      },
    },
  ],
];
