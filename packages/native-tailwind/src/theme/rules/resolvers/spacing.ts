import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';
import { resolveEdges } from '../../theme.utils';

export const paddingThemeRules: Rule<BaseTheme>[] = [
  [
    /^p([xytrbl]?)-?(.*)/,
    {
      themeAlias: 'padding',
      resolver: resolveEdges('padding', 'padding'),
    },
  ],
];

export const marginThemeRules: Rule<BaseTheme>[] = [
  [
    /-?m([xytrbl]?)-?(.*)/,

    {
      themeAlias: 'margin',
      propertyAlias: 'margin',
      canBeNegative: true,
      resolver: resolveEdges('margin', 'margin'),
    },
  ],
];
