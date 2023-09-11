import { literal } from '@universal-labs/css/parser';
import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const borderThemeRules: Rule<BaseTheme>[] = [
  [
    literal('border-'),
    {
      themeAlias: 'borderColor',
      expansion: {
        kind: 'edges',
        prefix: 'border',
        suffix: 'Color',
      },
    },
  ],
  [
    /^border-([xytrbl])-(.*)/,
    {
      themeAlias: 'borderWidth',
      expansion: {
        kind: 'edges',
        prefix: 'border',
        suffix: 'Width',
      },
    },
  ],
  [
    /^border-(.+)$/,
    {
      themeAlias: 'borderColor',
    },
  ],
  [/^border-(.+)/, { themeAlias: 'borderWidth' }],
];
