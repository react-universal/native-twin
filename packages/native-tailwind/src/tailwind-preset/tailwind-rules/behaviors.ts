import { resolveColorValue, resolveThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';
import { globalKeywords } from '../../utils/mappings';

const outlineStyles = [
  'auto',
  'dashed',
  'dotted',
  'double',
  'hidden',
  'solid',
  'groove',
  'ridge',
  'inset',
  'outset',
  ...globalKeywords,
];

export const outlineRules: Rule<__Theme__>[] = [
  resolveThemeValue('outline-offset-', 'lineWidth', 'outlineWidth'),
  resolveColorValue('outline-color-', 'outlineColor'),
  resolveThemeValue('outline-offset-', 'lineWidth', 'outlineOffset'),
  ...[
    ...outlineStyles.map((x): Rule<__Theme__> => {
      return [
        `outline-${x}`,
        {
          outlineStyle: x,
        },
      ] as Rule<__Theme__>;
    }),
  ],
  ['outline-none', { outline: '2px solid transparent', outlineOffset: '2px' }],
];

export const appearanceRules: Rule[] = [
  [
    'appearance-none',
    {
      WebkitAppearance: 'none',
      appearance: 'none',
    },
  ],
];
