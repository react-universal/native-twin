import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const alignmentsThemeRules: Rule<BaseTheme>[] = [
  // Floats
  [
    /^float-(left|right|none)$/,
    ({ 1: $1 }) => {
      if (!$1) return null;
      return {
        float: $1,
      };
    },
  ],
  // Clear
  [
    /^clear-(left|right|none|both)$/,
    ({ 1: $1 }) => {
      if (!$1) return null;
      return {
        float: $1,
      };
    },
  ],
  // Overflow
  [
    /^(overflow(?:-[xy])?)-(auto|hidden|clip|visible|scroll)$/,
    ({ 1: $1, 2: $2 }) => {
      if (!$1 || !$2) return null;
      return {
        [$1]: $2,
      };
    },
  ],
  // Position
  [
    /^(static|fixed|absolute|relative|sticky)$/,
    ({ 1: $1 }) => {
      if (!$1) return null;
      return {
        position: $1,
      };
    },
  ],
];
