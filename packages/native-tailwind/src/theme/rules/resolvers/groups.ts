import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const groupAndPeerThemeRules: Rule<BaseTheme>[] = [
  [
    '(group|peer)([~/][^-[]+)?',
    {
      themeAlias: 'data',
      resolver: () => '',
    },
  ],
];
