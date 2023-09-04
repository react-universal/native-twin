import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const tableThemeRules: Rule<BaseTheme>[] = [
  [
    /^table-(auto|fixed)/,
    ({ 1: $1 }) => ({
      tableLayout: `${$1}`,
    }),
  ],
  [
    /(table-(caption|cell|column|row|(column|row|footer|header)-group))/,
    ({ 1: $1, $$ }) => ({
      display: `${$1}${$$}`,
    }),
  ],
];
