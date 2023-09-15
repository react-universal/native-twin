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
