import type { Rule, RuleResolver } from '../types/config.types';
import type { CSSObject } from '../types/css.types';
import type { BaseTheme } from '../types/theme.types';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  // COLOR UTILS
  [
    'bg-',
    {
      themeAlias: 'colors',
      propertyAlias: 'backgroundColor',
    },
  ],
  [
    'text-',
    {
      themeAlias: 'colors',
      propertyAlias: 'color',
    },
  ],
  // FLEX
  ['flex-', { themeAlias: 'flex' }],
  ['flex-', { themeAlias: 'flexDirection' }],
  ['items-', { themeAlias: 'alignItems' }],
  ['self-', { themeAlias: 'alignSelf' }],
  ['content-', { themeAlias: 'placeContent' }],
  ['justify-', { themeAlias: 'justifyItems' }],

  // GAP
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

  // LAYOUT
  [
    /aspect-(video|square)/,
    {
      themeAlias: 'aspectRatio',
      resolver: ({ 1: $1 }, context) => {
        if (!$1) return null;
        return {
          aspectRatio: context.theme('aspectRatio', $1),
        };
      },
    },
  ],
  [
    '(hidden|flex)',
    {
      themeAlias: 'display',
      resolver: (match, context) => {
        return {
          display: context.theme('display', match[0]),
        };
      },
    },
  ],

  // SPACING
  [
    /^p([xytrbl]?)-?(.*)/,
    {
      themeAlias: 'padding',
      resolver: edge('padding', 'padding'),
    },
  ],
  [
    /-?m([xytrbl]?)-?(.*)/,

    {
      themeAlias: 'margin',
      propertyAlias: 'margin',
      canBeNegative: true,
      resolver: edge('margin', 'margin'),
    },
  ],

  // FONT
  ['font-', { themeAlias: 'fontWeight' }],
  ['leading-', { themeAlias: 'lineHeight' }],
  // TEXT
  ['text-', { themeAlias: 'textAlign' }],
  [
    'text-',
    {
      themeAlias: 'fontSize',

      resolver(match, ctx) {
        const value = ctx.theme('fontSize', match.$$);
        if (!value) return null;
        if (typeof value[1] == 'string') {
          return {
            'font-size': value[0]!,
            'line-height': value[1]!,
          };
        }
        return {
          'font-size': value[0]!,
          'line-height': value[1].lineHeight,
          'font-weight': value[1].fontWeight,
          'letter-spacing': value[1].letterSpacing,
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
  return ({ 1: $1, 2: $2 }, context): any => {
    const edges =
      {
        x: 'lr',
        y: 'tb',
      }[$1 as 'x' | 'y'] || $1! + $1!;
    // if (!edges) return null;
    if (!edges[0] || !edges[1]) {
      return { [propertyPrefix + propertySuffix]: context.theme(property, $2) };
    }
    return {
      [propertyPrefix + '-' + position(edges[0]) + propertySuffix]: context.theme(
        property,
        $2,
      ),
      [propertyPrefix + '-' + position(edges[1]) + propertySuffix]: context.theme(
        property,
        $2,
      ),
    };
  };
}
