import { literal } from '@universal-labs/css/parser';
import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

const ratios = {
  square: '1/1',
  video: '16/9',
} satisfies Record<string, string>;

export const aspectRatioThemeRules: Rule<BaseTheme>[] = [
  [
    literal('aspect-'),
    {
      themeAlias: 'aspectRatio',
      themeValues: ratios,
    },
  ],
];
