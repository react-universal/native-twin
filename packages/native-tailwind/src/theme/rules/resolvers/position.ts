import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const positionThemeRules: Rule<BaseTheme>[] = [
  [
    '-?(top|bottom|left|right)(?:$|-)',
    {
      themeAlias: 'inset',
      canBeNegative: true,
      resolver: ({ $$, 1: $1, '0': $0 }, ctx) => {
        const value = ctx.theme('inset', $$);
        return {
          [$1!]: `${$0.startsWith('-') ? '-' : ''}${value}`,
        };
      },
    },
  ],
  [/^-?z-(.*)/, { themeAlias: 'zIndex', canBeNegative: true }],
];
