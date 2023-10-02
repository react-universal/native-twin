import type { __Theme__ } from '@universal-labs/native-twin';
import { createPercentRatios } from '@universal-labs/native-twin';
import { spacing } from './mixed';

export const flexGrow = {
  DEFAULT: '1',
  0: '0',
  1: '1',
} satisfies __Theme__['flexGrow'];

export const flexBasis = {
  ...spacing,
  .../* #__PURE__ */ createPercentRatios(2, 6),
  .../* #__PURE__ */ createPercentRatios(12, 12),
  auto: 'auto',
  full: '100%',
} satisfies __Theme__['flexBasis'];

export const flex = {
  1: '1 1 0%',
  auto: '1 1 auto',
  initial: '0 1 auto',
  none: 'none',
} satisfies __Theme__['flex'];

export const flexDirection = {
  col: 'column',
  'col-reverse': 'column-reverse',
  row: 'row',
  'row-reverse': 'row-reverse',
} satisfies __Theme__['flexDirection'];

export const flexWrap = {
  wrap: 'wrap',
  'wrap-reverse': 'wrap-reverse',
  nowrap: 'nowrap',
} satisfies __Theme__['flexWrap'];

export const justifyContent = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: 'space-stretch',
} satisfies __Theme__['justifyContent'];

export const alignItems = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  auto: 'auto',
  stretch: 'stretch',
  baseline: 'baseline',
} satisfies __Theme__['alignItems'];

export const alignContent = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
  between: 'space-between',
  around: 'space-around',
} satisfies __Theme__['alignContent'];
