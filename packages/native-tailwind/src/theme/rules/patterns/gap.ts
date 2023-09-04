import type { Rule } from '../../../types/config.types';
import type { CSSObject } from '../../../types/css.types';
import type { BaseTheme } from '../../../types/theme.types';

export const gapThemeRules: Rule<BaseTheme>[] = [
  [
    /gap-([xy]?)-?(.*)/,
    {
      themeAlias: 'gap',
      resolver: ({ 1: $axis, 2: $value }, context) => {
        if (!$value) return null;
        let prop = 'gap';
        if ($axis == 'x') prop = 'rowGap';
        if ($axis == 'y') prop = 'columnGap';
        return {
          [prop]: context.theme('gap', $value),
        } as CSSObject;
      },
    },
  ],
];
