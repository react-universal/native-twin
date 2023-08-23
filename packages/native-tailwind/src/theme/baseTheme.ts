import { TailwindTheme, ThemeSection } from './theme.types';
import {
  themeAlias,
  createExponentialUnits,
  createLinearUnits,
  createPercentRatios,
} from './theme.utils';

export type OmitedSections =
  | 'aria'
  | 'backgroundPosition'
  | 'colors'
  | 'container'
  | 'cursor'
  | 'data'
  | 'gridColumnEnd'
  | 'gridColumnStart'
  | 'gridRowEnd'
  | 'gridRowStart'
  | 'listStyleType'
  | 'objectPosition'
  | 'supports'
  | 'transformOrigin';

export type StableSections =
  | 'screens'
  | 'columns'
  | 'spacing'
  | 'durations'
  | 'borderRadius'
  | 'borderWidth'
  | 'boxShadow'
  | 'fontFamily'
  | 'fontSize';

export type BaseTheme = {
  [Section in StableSections]: Section extends 'fontSize'
    ? {
        xs: [size: string, lineHeight: string];
        sm: [size: string, lineHeight: string];
        base: [size: string, lineHeight: string];
        lg: [size: string, lineHeight: string];
        xl: [size: string, lineHeight: string];
        '2xl': [size: string, lineHeight: string];
        '3xl': [size: string, lineHeight: string];
        '4xl': [size: string, lineHeight: string];
        '5xl': [size: string, lineHeight: string];
        '6xl': [size: string, lineHeight: string];
        '7xl': [size: string, lineHeight: string];
        '8xl': [size: string, lineHeight: string];
        '9xl': [size: string, lineHeight: string];
      }
    : TailwindTheme[Section];
} & {
  [Section in Exclude<keyof TailwindTheme, StableSections | OmitedSections>]: ThemeSection<
    TailwindTheme[Section],
    TailwindTheme
  >;
} & {
  [Section in OmitedSections]?: ThemeSection<TailwindTheme[Section], TailwindTheme>;
};

export const baseTailwindTheme: BaseTheme = {
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  columns: {
    auto: 'auto',
    ...createLinearUnits(12, '', 1, 1), // unitless from 1-12
    '3xs': '16rem',
    '2xs': '18rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
  },
  spacing: {
    px: '1px',
    0: '0px',
    .../* #__PURE__ */ createLinearUnits(4, 'rem', 4, 0.5, 0.5),
    // 0.5: '0.125rem',
    // ...
    // 4: '1rem',
    .../* #__PURE__ */ createLinearUnits(12, 'rem', 4, 5),
    // 5: '1.25rem',
    // ...
    // 12: '3rem',
    14: '3.5rem',
    .../* #__PURE__ */ createLinearUnits(64, 'rem', 4, 16, 4),
    // 16: '4rem',
    // 20: '5rem',
    // ...
    // 60: '15rem',
    // 64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  durations: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  animation: {
    none: 'none',
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0,0,0.2,1) infinite',
    pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
    bounce: 'bounce 1s infinite',
  },
  aspectRatio: {
    auto: 'auto',
    square: '1/1',
    video: '16/9',
  },
  backdropBlur: /* #__PURE__ */ themeAlias('blur'),
  backdropBrightness: /* #__PURE__ */ themeAlias('brightness'),
  backdropContrast: /* #__PURE__ */ themeAlias('contrast'),
  backdropGrayscale: /* #__PURE__ */ themeAlias('grayscale'),
  backdropHueRotate: /* #__PURE__ */ themeAlias('hueRotate'),
  backdropInvert: /* #__PURE__ */ themeAlias('invert'),
  backdropOpacity: /* #__PURE__ */ themeAlias('opacity'),
  backdropSaturate: /* #__PURE__ */ themeAlias('saturate'),
  backdropSepia: /* #__PURE__ */ themeAlias('sepia'),

  backgroundColor: /* #__PURE__ */ themeAlias('colors'),
  backgroundImage: {
    none: 'none',
    // These are built-in
    // 'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
    // 'gradient-to-tr': 'linear-gradient(to top right, var(--tw-gradient-stops))',
    // 'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
    // 'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
    // 'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
    // 'gradient-to-bl': 'linear-gradient(to bottom left, var(--tw-gradient-stops))',
    // 'gradient-to-l': 'linear-gradient(to left, var(--tw-gradient-stops))',
    // 'gradient-to-tl': 'linear-gradient(to top left, var(--tw-gradient-stops))',
  },
  backgroundOpacity: /* #__PURE__ */ themeAlias('opacity'),
  // backgroundPosition: {
  //   // The following are already handled by the plugin:
  //   // center, right, left, bottom, top
  //   // 'bottom-10px-right-20px' -> bottom 10px right 20px
  // },
  backgroundSize: {
    auto: 'auto',
    cover: 'cover',
    contain: 'contain',
  },
  blur: {
    none: 'none',
    0: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
  brightness: {
    .../* #__PURE__ */ createLinearUnits(200, '', 100, 0, 50),
    // 0: '0',
    // ...
    // 200: '2',

    .../* #__PURE__ */ createLinearUnits(110, '', 100, 90, 5),
    // 90: '.9',
    // ...
    // 110: '1.1',
    75: '0.75',
    125: '1.25',
  },
  borderColor: ({ theme }) => ({
    DEFAULT: theme('colors.gray.200', 'currentColor'),
    ...theme('colors'),
  }),
  borderOpacity: /* #__PURE__ */ themeAlias('opacity'),
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    '1/2': '50%',
    full: '9999px',
  },
  borderSpacing: /* #__PURE__ */ themeAlias('spacing'),
  borderWidth: {
    DEFAULT: '1px',
    .../* #__PURE__ */ createExponentialUnits(8, 'px'),
    // 0: '0px',
    // ...
    // 8: '8px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
    none: '0 0 #0000',
  },
  boxShadowColor: themeAlias('colors'),
  // container: {},
  // cursor: {
  //   // Default values are handled by plugin
  // },
  caretColor: /* #__PURE__ */ themeAlias('colors'),
  accentColor: ({ theme }) => ({
    auto: 'auto',
    ...theme('colors'),
  }),
  contrast: {
    .../* #__PURE__ */ createLinearUnits(200, '', 100, 0, 50),
    // 0: '0',
    // ...
    // 200: '2',
    75: '0.75',
    125: '1.25',
  },
  content: {
    none: 'none',
  },
  divideColor: /* #__PURE__ */ themeAlias('borderColor'),
  divideOpacity: /* #__PURE__ */ themeAlias('borderOpacity'),
  divideWidth: /* #__PURE__ */ themeAlias('borderWidth'),
  dropShadow: {
    sm: '0 1px 1px rgba(0,0,0,0.05)',
    DEFAULT: ['0 1px 2px rgba(0,0,0,0.1)', '0 1px 1px rgba(0,0,0,0.06)'],
    md: ['0 4px 3px rgba(0,0,0,0.07)', '0 2px 2px rgba(0,0,0,0.06)'],
    lg: ['0 10px 8px rgba(0,0,0,0.04)', '0 4px 3px rgba(0,0,0,0.1)'],
    xl: ['0 20px 13px rgba(0,0,0,0.03)', '0 8px 5px rgba(0,0,0,0.08)'],
    '2xl': '0 25px 25px rgba(0,0,0,0.15)',
    none: '0 0 #0000',
  },
  fill: ({ theme }) => ({
    ...theme('colors'),
    none: 'none',
  }),
  grayscale: {
    DEFAULT: '100%',
    0: '0',
  },
  hueRotate: {
    0: '0deg',
    15: '15deg',
    30: '30deg',
    60: '60deg',
    90: '90deg',
    180: '180deg',
  },
  invert: {
    DEFAULT: '100%',
    0: '0',
  },
  flex: {
    1: '1 1 0%',
    auto: '1 1 auto',
    initial: '0 1 auto',
    none: 'none',
  },
  flexBasis: ({ theme }) => ({
    ...theme('spacing'),
    ...createPercentRatios(2, 6),
    // '1/2': '50%',
    // ...
    // '5/6': '83.333333%',

    ...createPercentRatios(12, 12),
    // '1/12': '8.333333%',
    // ...
    // '11/12': '91.666667%',

    auto: 'auto',
    full: '100%',
  }),
  flexGrow: {
    DEFAULT: 1,
    0: 0,
  },
  flexShrink: {
    DEFAULT: 1,
    0: 0,
  },
  fontFamily: {
    sans: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'.split(
      ',',
    ),
    serif: 'ui-serif,Georgia,Cambria,"Times New Roman",Times,serif'.split(','),
    mono: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'.split(
      ',',
    ),
  },
  fontSize: {
    xs: ['0.75rem', '1rem'],
    sm: ['0.875rem', '1.25rem'],
    base: ['1rem', '1.5rem'],
    lg: ['1.125rem', '1.75rem'],
    xl: ['1.25rem', '1.75rem'],
    '2xl': ['1.5rem', '2rem'],
    '3xl': ['1.875rem', '2.25rem'],
    '4xl': ['2.25rem', '2.5rem'],
    '5xl': ['3rem', '1'],
    '6xl': ['3.75rem', '1'],
    '7xl': ['4.5rem', '1'],
    '8xl': ['6rem', '1'],
    '9xl': ['8rem', '1'],
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  gap: /* #__PURE__ */ themeAlias('spacing'),
  gradientColorStops: /* #__PURE__ */ themeAlias('colors'),
  gridAutoColumns: {
    auto: 'auto',
    min: 'min-content',
    max: 'max-content',
    fr: 'minmax(0,1fr)',
  },
  gridAutoRows: {
    auto: 'auto',
    min: 'min-content',
    max: 'max-content',
    fr: 'minmax(0,1fr)',
  },
  gridColumn: {
    // span-X is handled by the plugin: span-1 -> span 1 / span 1
    auto: 'auto',
    'span-full': '1 / -1',
  },
  // gridColumnEnd: {
  //   // Defaults handled by plugin
  // },
  // gridColumnStart: {
  //   // Defaults handled by plugin
  // },
  gridRow: {
    // span-X is handled by the plugin: span-1 -> span 1 / span 1
    auto: 'auto',
    'span-full': '1 / -1',
  },
  // gridRowStart: {
  //   // Defaults handled by plugin
  // },
  // gridRowEnd: {
  //   // Defaults handled by plugin
  // },
  gridTemplateColumns: {
    // numbers are handled by the plugin: 1 -> repeat(1, minmax(0, 1fr))
    none: 'none',
  },
  gridTemplateRows: {
    // numbers are handled by the plugin: 1 -> repeat(1, minmax(0, 1fr))
    none: 'none',
  },
  height: ({ theme }) => ({
    ...theme('spacing'),
    ...createPercentRatios(2, 6),
    // '1/2': '50%',
    // ...
    // '5/6': '83.333333%',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
    auto: 'auto',
    full: '100%',
    screen: '100vh',
  }),
  inset: ({ theme }) => ({
    ...theme('spacing'),
    ...createPercentRatios(2, 4),
    // '1/2': '50%',
    // ...
    // '3/4': '75%',
    auto: 'auto',
    full: '100%',
  }),
  keyframes: {
    spin: {
      from: {
        transform: 'rotate(0deg)',
      },
      to: {
        transform: 'rotate(360deg)',
      },
    },
    ping: {
      '0%': {
        transform: 'scale(1)',
        opacity: '1',
      },
      '75%,100%': {
        transform: 'scale(2)',
        opacity: '0',
      },
    },
    pulse: {
      '0%,100%': {
        opacity: '1',
      },
      '50%': {
        opacity: '.5',
      },
    },
    bounce: {
      '0%, 100%': {
        transform: 'translateY(-25%)',
        animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
      },
      '50%': {
        transform: 'none',
        animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
      },
    },
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  lineHeight: {
    .../* #__PURE__ */ createLinearUnits(10, 'rem', 4, 3),
    // 3: '.75rem',
    // ...
    // 10: '2.5rem',
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  // listStyleType: {
  //   // Defaults handled by plugin
  // },
  margin: ({ theme }) => ({
    auto: 'auto',
    ...theme('spacing'),
  }),
  maxHeight: ({ theme }) => ({
    full: '100%',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
    screen: '100vh',
    ...theme('spacing'),
  }),
  maxWidth: ({ theme, breakpoints }) => ({
    ...breakpoints(theme('screens')),
    none: 'none',
    0: '0rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    full: '100%',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
    prose: '65ch',
  }),
  minHeight: {
    0: '0px',
    full: '100%',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
    screen: '100vh',
  },
  minWidth: {
    0: '0px',
    full: '100%',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
  },
  // objectPosition: {
  //   // The plugins joins all arguments by default
  // },
  opacity: {
    .../* #__PURE__ */ createLinearUnits(100, '', 100, 0, 10),
    // 0: '0',
    // ...
    // 100: '1',
    5: '0.05',
    25: '0.25',
    75: '0.75',
    95: '0.95',
  },
  order: {
    // Handled by plugin
    // 1: '1',
    // ...
    // 12: '12',
    first: '-9999',
    last: '9999',
    none: '0',
  },
  padding: /* #__PURE__ */ themeAlias('spacing'),
  placeholderColor: /* #__PURE__ */ themeAlias('colors'),
  placeholderOpacity: /* #__PURE__ */ themeAlias('opacity'),
  outlineColor: /* #__PURE__ */ themeAlias('colors'),
  outlineOffset: /* #__PURE__ */ createExponentialUnits(8, 'px'),
  // 0: '0px',
  // ...
  // 8: '8px',,
  outlineWidth: /* #__PURE__ */ createExponentialUnits(8, 'px'),
  // 0: '0px',
  // ...
  // 8: '8px',
  ringColor: ({ theme }) => ({
    ...theme('colors'),
    DEFAULT: '#3b82f6',
  }),
  ringOffsetColor: /* #__PURE__ */ themeAlias('colors'),
  ringOffsetWidth: /* #__PURE__ */ createExponentialUnits(8, 'px'),
  // 0: '0px',
  // ...
  // 8: '8px',,
  ringOpacity: ({ theme }) => ({
    ...theme('opacity'),
    DEFAULT: '0.5',
  }),
  ringWidth: {
    DEFAULT: '3px',
    .../* #__PURE__ */ createExponentialUnits(8, 'px'),
    // 0: '0px',
    // ...
    // 8: '8px',
  },
  rotate: {
    .../* #__PURE__ */ createExponentialUnits(2, 'deg'),
    // 0: '0deg',
    // 1: '1deg',
    // 2: '2deg',
    .../* #__PURE__ */ createExponentialUnits(12, 'deg', 3),
    // 3: '3deg',
    // 6: '6deg',
    // 12: '12deg',
    .../* #__PURE__ */ createExponentialUnits(180, 'deg', 45),
    // 45: '45deg',
    // 90: '90deg',
    // 180: '180deg',
  },
  saturate: /* #__PURE__ */ createLinearUnits(200, '', 100, 0, 50),
  // 0: '0',
  // ...
  // 200: '2',
  scale: {
    .../* #__PURE__ */ createLinearUnits(150, '', 100, 0, 50),
    // 0: '0',
    // 50: '.5',
    // 150: '1.5',
    .../* #__PURE__ */ createLinearUnits(110, '', 100, 90, 5),
    // 90: '.9',
    // ...
    // 110: '1.1',
    75: '0.75',
    125: '1.25',
  },
  scrollMargin: /* #__PURE__ */ themeAlias('spacing'),
  scrollPadding: /* #__PURE__ */ themeAlias('spacing'),
  sepia: {
    0: '0',
    DEFAULT: '100%',
  },
  skew: {
    .../* #__PURE__ */ createExponentialUnits(2, 'deg'),
    // 0: '0deg',
    // 1: '1deg',
    // 2: '2deg',
    .../* #__PURE__ */ createExponentialUnits(12, 'deg', 3),
    // 3: '3deg',
    // 6: '6deg',
    // 12: '12deg',
  },
  space: /* #__PURE__ */ themeAlias('spacing'),
  stroke: ({ theme }) => ({
    ...theme('colors'),
    none: 'none',
  }),
  strokeWidth: /* #__PURE__ */ createLinearUnits(2),
  // 0: '0',
  // 1: '1',
  // 2: '2',,
  textColor: /* #__PURE__ */ themeAlias('colors'),
  textDecorationColor: /* #__PURE__ */ themeAlias('colors'),
  textDecorationThickness: {
    'from-font': 'from-font',
    auto: 'auto',
    .../* #__PURE__ */ createExponentialUnits(8, 'px'),
    // 0: '0px',
    // ...
    // 8: '8px',
  },
  textUnderlineOffset: {
    auto: 'auto',
    .../* #__PURE__ */ createExponentialUnits(8, 'px'),
    // 0: '0px',
    // ...
    // 8: '8px',
  },
  textIndent: /* #__PURE__ */ themeAlias('spacing'),
  textOpacity: /* #__PURE__ */ themeAlias('opacity'),
  // transformOrigin: {
  //   // The following are already handled by the plugin:
  //   // center, right, left, bottom, top
  //   // 'bottom-10px-right-20px' -> bottom 10px right 20px
  // },
  transitionDuration: ({ theme }) => ({
    ...theme('durations'),
    DEFAULT: '150ms',
  }),
  transitionDelay: /* #__PURE__ */ themeAlias('durations'),
  transitionProperty: {
    none: 'none',
    all: 'all',
    DEFAULT:
      'color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter',
    colors: 'color,background-color,border-color,text-decoration-color,fill,stroke',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
  transitionTimingFunction: {
    DEFAULT: 'cubic-bezier(0.4,0,0.2,1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4,0,1,1)',
    out: 'cubic-bezier(0,0,0.2,1)',
    'in-out': 'cubic-bezier(0.4,0,0.2,1)',
  },
  translate: ({ theme }) => ({
    ...theme('spacing'),
    ...createPercentRatios(2, 4),
    // '1/2': '50%',
    // ...
    // '3/4': '75%',
    full: '100%',
  }),
  width: ({ theme }) => ({
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
    screen: '100vw',
    ...theme('flexBasis'),
  }),
  willChange: {
    scroll: 'scroll-position',
    // other options handled by rules
    // auto: 'auto',
    // contents: 'contents',
    // transform: 'transform',
  },
  zIndex: {
    .../* #__PURE__ */ createLinearUnits(50, '', 1, 0, 10),
    // 0: '0',
    // ...
    // 50: '50',
    auto: 'auto',
  },
};
