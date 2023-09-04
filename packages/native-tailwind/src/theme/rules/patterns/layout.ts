import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const displayThemeRules: Rule<BaseTheme>[] = [
  [
    /^(hidden|flex|inline|block|table|grid|contents|flow-root|list-item)$/,
    ({ 1: $1 }) => ({
      display: $1 == 'hidden' ? 'none' : $1,
    }),
  ],
  [
    /^(inline-(block|flex|table|grid))/,
    ({ 1: $1 }) => {
      return {
        display: `${$1}`,
      };
    },
  ],
];
