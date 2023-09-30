import * as P from '@universal-labs/arc-parser';
import type { AnyStyle } from '../../types/rn.types';
import { ParseCssDimensions } from '../dimensions.parser';

export const ParseSkewValue = P.sequenceOf([
  P.choice([P.literal('skewX'), P.literal('skewY')]),
  P.betweenParens(ParseCssDimensions),
]).map(([key, value]): AnyStyle['transform'] => {
  const result: AnyStyle['transform'] = [];
  if (key == 'skewX') {
    result.push({ skewX: `${value}` });
  }
  if (key == 'skewY') {
    result.push({ skewY: `${value}` });
  }
  return result;
});
