import { Rule } from '../types/config.types';
import { BaseTheme } from '../types/theme.types';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  // COLOR UTILS
  ['bg-', { themeAlias: 'colors', propertyAlias: 'backgroundColor', isColor: true }],
  ['text-', { themeAlias: 'colors', propertyAlias: 'color', isColor: true }],
  // FLEX
  ['flex-', { themeAlias: 'flex' }],
  ['flex-', { themeAlias: 'flexDirection' }],
  ['items-', { themeAlias: 'alignItems' }],
  ['self-', { themeAlias: 'alignSelf' }],
  ['content-', { themeAlias: 'placeContent' }],
  ['justify-', { themeAlias: 'justifyItems' }],

  // GAP
  [['gap-', 'gap-x', 'gap-y'], { themeAlias: 'gap' }],

  // // LAYOUT
  ['aspect-', { themeAlias: 'aspectRatio' }],
  [['hidden', 'flex'], { themeAlias: 'display' }],

  // SPACING
  [['p-', 'px-', 'py-'], { themeAlias: 'padding', canBeNegative: true }],
  [['m-', 'mx-', 'my-'], { themeAlias: 'margin', canBeNegative: true }],

  // FONT
  ['font-', { themeAlias: 'fontWeight' }],
  ['leading-', { themeAlias: 'lineHeight' }],
  // TEXT
  ['text-', { themeAlias: 'textAlign' }],
  [
    'text-',
    {
      themeAlias: 'fontSize',
      resolver(match) {
        if (typeof match == 'string') {
          return {
            fontSize: match,
          };
        }
        return {
          fontSize: match[0],
          lineHeight: match[1],
        };
      },
    },
  ],
];
