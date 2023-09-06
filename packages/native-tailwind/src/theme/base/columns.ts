import { createLinearUnits } from '../theme.utils';

export const columnsThemeValue = {
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
};
