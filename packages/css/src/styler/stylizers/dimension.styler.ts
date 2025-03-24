import type { DimensionValue as RNDimensionValue } from 'react-native';
import type { DimensionValue } from '../../react-native/declarations/declaration.value';
import type { CreateStylerInput } from '../styler.types';

export const toRNDimensionValue = (
  { unit, value }: DimensionValue,
  units: CreateStylerInput,
): RNDimensionValue | null => {
  if (unit === 'vh') {
    if (!units.vh) return null;
    return units.vh * (value / 100);
  }
  if (unit === 'vw') {
    if (!units.vw) return null;
    return units.vw * (value / 100);
  }
  switch (unit) {
    case 'px':
      return value;
    case 'rem':
    case 'em':
      return value * units.rem;
    case '%':
      return `${value}%` as unknown as number;
    case 'turn':
      return `${360 * value}deg` as unknown as number;
    case 'deg':
      return `${value}deg` as unknown as number;
    case 'rad':
      return `${value}rad` as unknown as number;
    case 'in':
      return value * 96;
    case 'pc':
      return value * (96 / 6);
    case 'pt':
      return value * (96 / 72);
    case 'cm':
      return value * 97.8;
    case 'mm':
      return value * (97.8 / 10);
    case 'Q':
      return value * (97.8 / 40);
    default:
      return null;
  }
};
