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
  [
    /^object-(contain|cover|fill|none|scale-down)$/,
    ({ 1: $1 }) => {
      if (!$1) return null;
      return {
        objectFit: $1,
      };
    },
  ],
  [
    /^object-(center|bottom|inherit|initial|left|revert|right|top|unset)$/,
    ({ 1: $1 }) => {
      if (!$1) return null;
      return {
        objectPosition: $1,
      };
    },
  ],
  [
    /^object-(top|bottom|center|(left|right)(-(top|bottom))?)$/,
    ({ 1: $1 }) => {
      if (!$1) return null;
      return {
        objectPosition: $1.replace(/-/g, ' '),
      };
    },
  ],
];
