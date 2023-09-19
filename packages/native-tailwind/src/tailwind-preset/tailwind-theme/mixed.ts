import type { __Theme__ } from '../../types/theme.types';
import { createExponentialUnits, createLinearUnits } from '../../utils/theme-utils';

// keep in ASC order: container.ts and breakpoints.ts need that order
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} satisfies __Theme__['breakpoints'];

export const opacity = {
  .../* #__PURE__ */ createLinearUnits(100, '', 100, 0, 10),
  5: '0.05',
  25: '0.25',
  75: '0.75',
  95: '0.95',
} satisfies __Theme__['opacity'];

export const verticalBreakpoints = { ...breakpoints } satisfies __Theme__['breakpoints'];

export const lineWidth = {
  DEFAULT: '1px',
  none: '0',
  .../* #__PURE__ */ createLinearUnits(10, 'rem', 4, 3),
} satisfies __Theme__['lineWidth'];

export const spacing = {
  DEFAULT: '1rem',
  none: '0',
  xs: '0.75rem',
  sm: '0.875rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',

  // CUSTOM
  px: '1px',
  0: '0px',
  .../* #__PURE__ */ createLinearUnits(4, 'rem', 4, 0.5, 0.5),
  .../* #__PURE__ */ createLinearUnits(12, 'rem', 4, 5),
  14: '3.5rem',
  .../* #__PURE__ */ createLinearUnits(64, 'rem', 4, 16, 4),
  72: '18rem',
  80: '20rem',
  96: '24rem',
} satisfies __Theme__['spacing'];

export const duration = {
  DEFAULT: '150ms',
  none: '0s',
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} satisfies __Theme__['duration'];

export const borderRadius = {
  DEFAULT: '0.25rem',
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '1/2': '50%',
  full: '9999px',
} satisfies __Theme__['borderRadius'];

export const borderStyle = {
  solid: 'solid',
  dotted: 'dotted',
  dashed: 'dashed',
} satisfies __Theme__['borderStyle'];

export const boxShadow = {
  DEFAULT: [
    'var(--un-shadow-inset) 0 1px 3px 0 rgba(0,0,0,0.1)',
    'var(--un-shadow-inset) 0 1px 2px -1px rgba(0,0,0,0.1)',
  ],
  none: '0 0 rgba(0,0,0,0)',
  sm: 'var(--un-shadow-inset) 0 1px 2px 0 rgba(0,0,0,0.05)',
  md: [
    'var(--un-shadow-inset) 0 4px 6px -1px rgba(0,0,0,0.1)',
    'var(--un-shadow-inset) 0 2px 4px -2px rgba(0,0,0,0.1)',
  ],
  lg: [
    'var(--un-shadow-inset) 0 10px 15px -3px rgba(0,0,0,0.1)',
    'var(--un-shadow-inset) 0 4px 6px -4px rgba(0,0,0,0.1)',
  ],
  xl: [
    'var(--un-shadow-inset) 0 20px 25px -5px rgba(0,0,0,0.1)',
    'var(--un-shadow-inset) 0 8px 10px -6px rgba(0,0,0,0.1)',
  ],
  '2xl': 'var(--un-shadow-inset) 0 25px 50px -12px rgba(0,0,0,0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
} satisfies __Theme__['boxShadow'];

export const easing = {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
} satisfies __Theme__['easing'];

export const ringWidth = {
  DEFAULT: '1px',
  none: '0',
} satisfies __Theme__['ringWidth'];

export const borderWidth = {
  DEFAULT: '1px',
  .../* #__PURE__ */ createExponentialUnits(8, 'px'),
} satisfies __Theme__['borderWidth'];

export const zIndex = {
  .../* #__PURE__ */ createLinearUnits(50, '', 1, 0, 10),
  auto: 'auto',
} satisfies __Theme__['zIndex'];

export const overflow = {
  visible: 'visible',
  hidden: 'hidden',
  none: 'scroll',
} satisfies __Theme__['overflow'];

export const objectFit = {
  cover: 'cover',
  contain: 'contain',
  fill: 'fill',
  'scale-down': 'scale-down',
} satisfies __Theme__['objectFit'];

export const position = {
  absolute: 'absolute',
  relative: 'relative',
} satisfies __Theme__['position'];
