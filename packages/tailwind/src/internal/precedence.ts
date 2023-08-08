import type { BaseTheme, Context } from '../types';
import type { ParsedRule } from './parse';
import { asArray, mql } from '../utils';
import { toClassName } from './to-class-name';

// Based on https://github.com/kripod/otion
// License MIT

// export const enum Shifts {
//   darkMode = 30,
//   layer = 27,
//   screens = 26,
//   responsive = 22,
//   atRules = 18,
//   variants = 0,
// }

export const Layer = {
  /**
   * 1. `default` (public)
   */
  d /* efaults */: 0b000 << 27 /* Shifts.layer */,

  /**
   * 2. `base` (public) — for things like reset rules or default styles applied to plain HTML elements.
   */
  b /* ase */: 0b001 << 27 /* Shifts.layer */,

  /**
   * 3. `components` (public, used by `style()`) — is for class-based styles that you want to be able to override with utilities.
   */
  c /* omponents */: 0b010 << 27 /* Shifts.layer */,
  // reserved for style():
  // - props: 0b011
  // - when: 0b100

  /**
   * 6. `aliases` (public, used by `apply()`) — `~(...)`
   */
  a /* liases */: 0b101 << 27 /* Shifts.layer */,

  /**
   * 6. `utilities` (public) — for small, single-purpose classes
   */
  u /* tilities */: 0b110 << 27 /* Shifts.layer */,

  /**
   * 7. `overrides` (public, used by `css()`)
   */
  o /* verrides */: 0b111 << 27 /* Shifts.layer */,
} as const;

/*
To have a predictable styling the styles must be ordered.

This order is represented by a precedence number. The lower values
are inserted before higher values. Meaning higher precedence styles
overwrite lower precedence styles.

Each rule has some traits that are put into a bit set which form
the precedence:

| bits | trait                                                |
| ---- | ---------------------------------------------------- |
| 1    | dark mode                                            |
| 2    | layer: preflight, global, components, utilities, css |
| 1    | screens: is this a responsive variation of a rule    |
| 5    | responsive based on min-width                        |
| 4    | at-rules                                             |
| 18   | pseudo and group variants                            |
| 4    | number of declarations (descending)                  |
| 4    | greatest precedence of properties                    |

**Dark Mode: 1 bit**

Flag for dark mode rules.

**Layer: 3 bits**

- defaults = 0: The preflight styles and any base styles registered by plugins.
- base = 1: The global styles registered by plugins.
- components = 2
- variants = 3
- compounds = 4
- aliases = 5
- utilities = 6: Utility classes and any utility classes registered by plugins.
- css = 7: Styles generated by css

**Screens: 1 bit**

Flag for screen variants. They may not always have a `min-width` to be detected by _Responsive_ below.

**Responsive: 4 bits**

Based on extracted `min-width` value:

- 576px -> 3
- 1536px -> 10
- 36rem -> 3
- 96rem -> 9

**At-Rules: 4 bits**

Based on the count of special chars (`-:,`) within the at-rule.

**Pseudo and group variants: 18 bits**

Ensures predictable order of pseudo classes.

- https://bitsofco.de/when-do-the-hover-focus-and-active-pseudo-classes-apply/#orderofstyleshoverthenfocusthenactive
- https://developer.mozilla.org/docs/Web/CSS/:active#Active_links
- https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js#L718

**Number of declarations (descending): 4 bits**

Allows single declaration styles to overwrite styles from multi declaration styles.

**Greatest precedence of properties: 4 bits**

Ensure shorthand properties are inserted before longhand properties; eg longhand override shorthand
*/

export function moveToLayer(precedence: number, layer: number): number {
  // Set layer (first reset, than set)
  return (precedence & ~Layer.o) | layer;
}

/*
To set a bit: n |= mask;
To clear a bit: n &= ~mask;
To test if a bit is set: (n & mask)

Bit shifts for the primary bits:

| bits | trait                                                   | shift |
| ---- | ------------------------------------------------------- | ----- |
| 1    | dark mode                                               | 30    |
| 3    | layer: preflight, global, components, utilities, css    | 27    |
| 1    | screens: is this a responsive variation of a rule       | 26    |
| 4    | responsive based on min-width, max-width or width       | 22    |
| 4    | at-rules                                                | 18    |
| 18   | pseudo and group variants                               | 0     |

Layer: 0 - 7: 3 bits
  - defaults: 0 << 27
  - base: 1 << 27
  - components: 2 << 27
  - variants: 3 << 27
  - joints: 4 << 27
  - aliases: 5 << 27
  - utilities: 6 << 27
  - overrides: 7 << 27

These are calculated by serialize and added afterwards:

| bits | trait                               |
| ---- | ----------------------------------- |
| 4    | number of selectors (descending)    |
| 4    | number of declarations (descending) |
| 4    | greatest precedence of properties   |

These are added by shifting the primary bits using multiplication as js only
supports bit shift up to 32 bits.
*/

// Colon and dash count of string (ascending)
export function separatorPrecedence(string: string): number {
  return string.match(/[-=:;]/g)?.length || 0;
}

export function atRulePrecedence(css: string): number {
  // 0 - 15: 4 bits (max 144rem or 2304px)
  // rem -> bit
  // <20 ->  0 (<320px)
  //  20 ->  1 (320px)
  //  24 ->  2 (384px)
  //  28 ->  3 (448px)
  //  32 ->  4 (512px)
  //  36 ->  5 (576px)
  //  42 ->  6 (672px)
  //  48 ->  7 (768px)
  //  56 ->  8 (896px)
  //  64 ->  9 (1024px)
  //  72 -> 10 (1152px)
  //  80 -> 11 (1280px)
  //  96 -> 12 (1536px)
  // 112 -> 13 (1792px)
  // 128 -> 14 (2048px)
  // 144 -> 15 (2304px)
  // https://www.dcode.fr/function-equation-finder
  return (
    (Math.min(
      /(?:^|width[^\d]+)(\d+(?:.\d+)?)(p)?/.test(css)
        ? Math.max(0, 29.63 * (+RegExp.$1 / (RegExp.$2 ? 15 : 1)) ** 0.137 - 43)
        : 0,
      15,
    ) <<
      22) /* Shifts.responsive */ |
    (Math.min(separatorPrecedence(css), 15) << 18) /* Shifts.atRules */
  );
}

// Pesudo variant presedence
// Chars 3 - 8: Uniquely identifies a pseudo selector
// represented as a bit set for each relevant value
// 18 bits: one for each variant plus one for unknown variants
//
// ':group-*' variants are normalized to their native pseudo class (':group-hover' -> ':hover')
// as they already have a higher selector presedence due to the add '.group' ('.group:hover .group-hover:...')

// Sources:
// - https://bitsofco.de/when-do-the-hover-focus-and-active-pseudo-classes-apply/#orderofstyleshoverthenfocusthenactive
// - https://developer.mozilla.org/docs/Web/CSS/:active#Active_links
// - https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js#L931

const PRECEDENCES_BY_PSEUDO_CLASS = [
  /* fi */ 'rst-c' /* hild: 0 */,
  /* la */ 'st-ch' /* ild: 1 */,
  // even and odd use: nth-child
  /* nt */ 'h-chi' /* ld: 2 */,
  /* an */ 'y-lin' /* k: 3 */,
  /* li */ 'nk' /* : 4 */,
  /* vi */ 'sited' /* : 5 */,
  /* ch */ 'ecked' /* : 6 */,
  /* em */ 'pty' /* : 7 */,
  /* re */ 'ad-on' /* ly: 8 */,
  /* fo */ 'cus-w' /* ithin : 9 */,
  /* ho */ 'ver' /* : 10 */,
  /* fo */ 'cus' /* : 11 */,
  /* fo */ 'cus-v' /* isible : 12 */,
  /* ac */ 'tive' /* : 13 */,
  /* di */ 'sable' /* d : 14 */,
  /* op */ 'tiona' /* l: 15 */,
  /* re */ 'quire' /* d: 16 */,
];

function pseudoPrecedence(selector: string): number {
  // use first found pseudo-class

  return (
    1 <<
    ~(
      (/:([a-z-]+)/.test(selector) &&
        ~PRECEDENCES_BY_PSEUDO_CLASS.indexOf(RegExp.$1.slice(2, 7))) ||
      ~17
    )
  );
}

// https://github.com/kripod/otion/blob/main/packages/otion/src/propertyMatchers.ts
// "+1": [
// 	/* ^border-.*(w|c|sty) */
// 	"border-.*(width,color,style)",

// 	/* ^[tlbr].{2,4}m?$ */
// 	"top",
// 	"left",
// 	"bottom",
// 	"right",

// 	/* ^c.{7}$ */
// 	"continue",

// 	/* ^c.{8}$ */
// 	"container",
// ],

// "-1": [
// 	/* ^[fl].{5}l */
// 	"flex-flow",
// 	"line-clamp",

// 	/* ^g.{8}$ */
// 	"grid-area",

// 	/* ^pl */
// 	"place-content",
// 	"place-items",
// 	"place-self",

// ],

// group: 1 => +1
// group: 2 => -1

// 0 - 15 => 4 bits
// Ignore vendor prefixed and custom properties
export function declarationPropertyPrecedence(property: string): number {
  return property[0] == '-'
    ? 0
    : separatorPrecedence(property) +
        (/^(?:(border-(?!w|c|sty)|[tlbr].{2,4}m?$|c.{7,8}$)|([fl].{5}l|g.{8}$|pl))/.test(
          property,
        )
          ? +!!RegExp.$1 /* +1 */ || -!!RegExp.$2 /* -1 */
          : 0) +
        1;
}

export interface ConvertedRule {
  /** The name to use for `&` expansion in selectors. Maybe empty for at-rules like `@import`, `@font-face`, `@media`, ... */
  n?: string | undefined;

  /** The calculated precedence taking all variants into account. */
  p: number;

  /** The rule-sets (selectors and at-rules). expanded variants `@media ...`, `@supports ...`, `&:focus`, `.dark &` */
  r?: string[];

  /** Is this rule `!important` eg something like `!underline` or `!bg-red-500` or `!red-500` */
  i?: boolean | undefined;
}

export function convert<Theme extends BaseTheme = BaseTheme>(
  { n: name, i: important, v: variants = [] }: Partial<ParsedRule>,
  context: Context<Theme>,
  precedence: number,
  conditions?: string[],
): ConvertedRule {
  if (name) {
    name = toClassName({ n: name, i: important!, v: variants });
  }

  conditions = [...asArray(conditions)];

  for (const variant of variants) {
    const screen = context.theme('screens', variant);

    for (const condition of asArray((screen && mql(screen)) || context.v(variant))) {
      conditions.push(condition);

      precedence |= screen
        ? (1 << 26) /* Shifts.screens */ | atRulePrecedence(condition)
        : variant == 'dark'
        ? 1 << 30 /* Shifts.darkMode */
        : condition[0] == '@'
        ? atRulePrecedence(condition)
        : pseudoPrecedence(condition);
    }
  }

  return { n: name, p: precedence, r: conditions, i: important };
}