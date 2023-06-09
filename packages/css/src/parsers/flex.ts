import type { CssFlexValueNode, CssValueDimensionNode } from '../types';
import { parseChar, parseChoice, parseDigit, parseMany, parseSeparatedBy } from './common';
import { parseDimensionsValue } from './units';

const spaceSeparated = parseSeparatedBy(parseChar(' '));

const getFlexValue = (
  x: string | CssValueDimensionNode | undefined,
  defaultValue: string,
): CssFlexValueNode['grow'] => {
  if (!x) {
    return {
      type: 'dimensions',
      value: defaultValue,
      unit: 'none',
    };
  }
  if (typeof x === 'object') {
    return x;
  }

  return {
    type: 'dimensions',
    value: x,
    unit: 'none',
  };
};

export const parseFlexStyle = spaceSeparated(
  parseMany(parseChoice([parseDimensionsValue, parseDigit])),
)
  .map((x) => x.flat(1))
  .map((x): CssFlexValueNode => {
    let grow = getFlexValue(x[0] as any, '1');
    let shrink = getFlexValue(x[1] as any, '1');
    let basis = getFlexValue(x[2] as any, '0%');
    return {
      type: 'flex',
      grow,
      shrink,
      basis,
    };
  });
