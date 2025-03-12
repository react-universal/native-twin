import type { CSSUnit } from '@native-twin/css';

/** @category Match */
export const getCSSUnitResolver = (unit: CSSUnit) => {
  switch (unit) {
    case 'px':
      return (value: string) => Number.parseFloat(value);
    case 'em':
    case 'rem':
      return (value: string, rem: number) => Number.parseFloat(value) * rem;
    case '%':
      return (value: string) => `${value}%`;
    case 'deg':
      return (value: string) => `${value}${unit}`;
    case 'rad':
    case 'turn':
      return (value: string) => `${360 * Number.parseFloat(value)}deg`;
    case 'pc':
      return (value: string) => Number.parseFloat(value) * (96 / 6);
    case 'in':
      return (value: string) => Number.parseFloat(value) * 96;
    case 'pt':
      return (value: string) => Number.parseFloat(value) * (96 / 72);
    case 'cm':
      return (value: string) => Number.parseFloat(value) * 97.8;
    case 'mm':
      return (value: string) => Number.parseFloat(value) * (97.8 / 10);
    case 'Q':
      return (value: string) => Number.parseFloat(value) * (97.8 / 40);
    case 'vh':
    case 'vw':
    case 'vmin':
    case 'vmax':
      return null;
    default:
      return null;
  }
};
