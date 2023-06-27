import type { Context } from '../css.types';
import type { CssValueDimensionNode } from '../types';

export function evaluateDimensionsValue(value: CssValueDimensionNode, context: Context) {
  if (value.unit === 'none') {
    return parseFloat(value.value);
  }
  if (value.unit === 'rem' || value.unit === 'em') {
    return parseFloat(value.value) * context.units.rem;
  }
  if (value.unit === 'vw') {
    return context.deviceWidth! * (parseFloat(value.value) / 100);
  }
  if (value.unit === 'vh') {
    return context.deviceHeight! * (parseFloat(value.value) / 100);
  }
  return parseFloat(value.value);
}
