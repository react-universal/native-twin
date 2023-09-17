import { createPercentRatios } from '../../utils/theme-utils';
import { spacing } from './mixed';

export const flexGrow = {
  DEFAULT: '1',
  0: '0',
};
export const flexBasis = {
  ...spacing,
  .../* #__PURE__ */ createPercentRatios(2, 6),
  .../* #__PURE__ */ createPercentRatios(12, 12),
  auto: 'auto',
  full: '100%',
};

export const flex = { 1: '1 1 0%', auto: '1 1 auto', initial: '0 1 auto', none: 'none' };

export const flexDirection = {
  col: 'column',
  'col-reverse': 'column-reverse',
  row: 'row',
  'row-reverse': 'row-reverse',
};

export const flexWrap = {
  wrap: 'wrap',
  'wrap-reverse': 'wrap-reverse',
  nowrap: 'nowrap',
};

export const justifyContent = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: 'space-stretch',
};
