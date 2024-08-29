export const CSS_COLORS = [
  'black',
  'silver',
  'gray',
  'white',
  'maroon',
  'red',
  'purple',
  'fuchsia',
  'green',
  'lime',
  'olive',
  'yellow',
  'navy',
  'blue',
  'teal',
  'aqua',
  'orange',
  'aliceblue',
  'antiquewhite',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'blanchedalmond',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'limegreen',
  'linen',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'oldlace',
  'olivedrab',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'whitesmoke',
  'yellowgreen',
  'rebeccapurple',
  'transparent',
] as const;

export const unitlessCssProps: { [key: string]: 1 } = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,

  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1,
};

const InteractionPseudoSelectors = ['hover', 'active', 'focus'] as const;

const GroupInteractionPseudoSelectors = [
  'group',
  'group-hover',
  'group-focus',
  'group-active',
] as const;

const AppearancePseudoSelectors = ['dark', 'light'] as const;

const ChildPseudoSelectors = ['last', 'first', 'even', 'odd'] as const;
const CssChildPseudoSelectors = ['last-child', 'first-child', 'even', 'odd'] as const;

const PlatformPseudoSelectors = ['native', 'ios', 'android', 'web'] as const;

const OwnSheetSelectors = ['base', 'pointer', 'group', 'dark'] as const;
export {
  InteractionPseudoSelectors,
  AppearancePseudoSelectors,
  PlatformPseudoSelectors,
  ChildPseudoSelectors,
  GroupInteractionPseudoSelectors,
  OwnSheetSelectors,
  CssChildPseudoSelectors,
};

export const simplePseudoMap = {
  ':-moz-any-link': true,
  ':-moz-full-screen': true,
  ':-moz-placeholder': true,
  ':-moz-read-only': true,
  ':-moz-read-write': true,
  ':-ms-fullscreen': true,
  ':-ms-input-placeholder': true,
  ':-webkit-any-link': true,
  ':-webkit-full-screen': true,
  '::-moz-placeholder': true,
  '::-moz-progress-bar': true,
  '::-moz-range-progress': true,
  '::-moz-range-thumb': true,
  '::-moz-range-track': true,
  '::-moz-selection': true,
  '::-ms-backdrop': true,
  '::-ms-browse': true,
  '::-ms-check': true,
  '::-ms-clear': true,
  '::-ms-fill': true,
  '::-ms-fill-lower': true,
  '::-ms-fill-upper': true,
  '::-ms-reveal': true,
  '::-ms-thumb': true,
  '::-ms-ticks-after': true,
  '::-ms-ticks-before': true,
  '::-ms-tooltip': true,
  '::-ms-track': true,
  '::-ms-value': true,
  '::-webkit-backdrop': true,
  '::-webkit-input-placeholder': true,
  '::-webkit-progress-bar': true,
  '::-webkit-progress-inner-value': true,
  '::-webkit-progress-value': true,
  '::-webkit-resizer': true,
  '::-webkit-scrollbar-button': true,
  '::-webkit-scrollbar-corner': true,
  '::-webkit-scrollbar-thumb': true,
  '::-webkit-scrollbar-track-piece': true,
  '::-webkit-scrollbar-track': true,
  '::-webkit-scrollbar': true,
  '::-webkit-slider-runnable-track': true,
  '::-webkit-slider-thumb': true,
  '::after': true,
  '::backdrop': true,
  '::before': true,
  '::cue': true,
  '::first-letter': true,
  '::first-line': true,
  '::grammar-error': true,
  '::placeholder': true,
  '::selection': true,
  '::spelling-error': true,
  ':active': true,
  ':after': true,
  ':any-link': true,
  ':before': true,
  ':blank': true,
  ':checked': true,
  ':default': true,
  ':defined': true,
  ':disabled': true,
  ':empty': true,
  ':enabled': true,
  ':first': true,
  ':first-child': true,
  ':first-letter': true,
  ':first-line': true,
  ':first-of-type': true,
  ':focus': true,
  ':focus-visible': true,
  ':focus-within': true,
  ':fullscreen': true,
  ':hover': true,
  ':in-range': true,
  ':indeterminate': true,
  ':invalid': true,
  ':last-child': true,
  ':last-of-type': true,
  ':left': true,
  ':link': true,
  ':only-child': true,
  ':only-of-type': true,
  ':optional': true,
  ':out-of-range': true,
  ':placeholder-shown': true,
  ':read-only': true,
  ':read-write': true,
  ':required': true,
  ':right': true,
  ':root': true,
  ':scope': true,
  ':target': true,
  ':valid': true,
  ':visited': true,
} as const;

export const simplePseudos = Object.keys(simplePseudoMap) as Array<
  keyof typeof simplePseudoMap
>;

export const simplePseudoLookup = simplePseudoMap as Record<string, boolean>;
