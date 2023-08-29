import { Rule, RuleResolver } from '../types/config.types';
import { CSSObject } from '../types/css.types';
import { BaseTheme } from '../types/theme.types';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  // COLOR UTILS
  [
    'bg-',
    {
      themeAlias: 'colors',
      propertyAlias: 'backgroundColor',
      isColor: true,
      support: ['native', 'web'],
    },
  ],
  [
    'text-',
    {
      themeAlias: 'colors',
      propertyAlias: 'color',
      isColor: true,
      support: ['native', 'web'],
    },
  ],
  // FLEX
  ['flex-', { themeAlias: 'flex', support: ['native', 'web'] }],
  ['flex-', { themeAlias: 'flexDirection', support: ['native', 'web'] }],
  ['items-', { themeAlias: 'alignItems', support: ['native', 'web'] }],
  ['self-', { themeAlias: 'alignSelf', support: ['native', 'web'] }],
  ['content-', { themeAlias: 'placeContent', support: ['native', 'web'] }],
  ['justify-', { themeAlias: 'justifyItems', support: ['native', 'web'] }],

  // GAP
  [
    /gap-([xy]?)-?(.*)/,
    ({ 1: $axis, 2: $value }, context) => {
      let prop = 'gap';
      if ($axis == 'x') prop = 'rowGap';
      if ($axis == 'y') prop = 'columnGap';
      return {
        [prop]: context.theme('gap', [$value]),
      } as CSSObject;
    },
  ],

  // // LAYOUT
  [
    /aspect-(video|square)/,
    ({ 1: $1 }, context) => {
      return {
        aspectRatio: context.theme('aspectRatio', [$1]),
      };
    },
  ],
  [
    '(hidden|flex)',
    (match, context) => {
      return {
        display: context.theme('display', [match[0]]),
      };
    },
  ],

  // SPACING
  [/p([xytrbl]?)-?(.*)/, edge('padding', 'padding')],
  [
    /-?m([xytrbl]?)-?(.*)/,
    edge('margin', 'margin'),
    // { themeAlias: 'margin', canBeNegative: true, support: ['native', 'web'] },
  ],

  // FONT
  ['font-', { themeAlias: 'fontWeight', support: ['native', 'web'] }],
  ['leading-', { themeAlias: 'lineHeight', support: ['native', 'web'] }],
  // TEXT
  ['text-', { themeAlias: 'textAlign', support: ['native', 'web'] }],
  [
    'text-',
    {
      themeAlias: 'fontSize',
      support: ['native', 'web'],
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

function position(shorthand: string, separator = '-'): string {
  const longhand: string[] = [];

  for (const short of shorthand) {
    longhand.push({ t: 'top', r: 'right', b: 'bottom', l: 'left' }[short] as string);
  }

  return longhand.join(separator);
}

function edge(property: string, propertyPrefix: string, propertySuffix = ''): RuleResolver {
  return ({ 1: $1, 2: $2 }, context) => {
    const edges =
      {
        x: 'lr',
        y: 'tb',
      }[$1 as 'x' | 'y'] || $1 + $1;
    return edges
      ? {
          [propertyPrefix + '-' + position(edges[0]) + propertySuffix]: context.theme(
            property,
            [$2],
          ),
          [propertyPrefix + '-' + position(edges[1]) + propertySuffix]: context.theme(
            property,
            [$2],
          ),
        }
      : { [propertyPrefix + propertySuffix]: context.theme(property, [$2]) };
  };
}
