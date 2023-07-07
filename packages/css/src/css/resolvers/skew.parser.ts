import { choice } from '../../parsers/choice.parser';
import { betweenParens } from '../../parsers/composed.parsers';
import { sequenceOf } from '../../parsers/sequence-of';
import { literal } from '../../parsers/string.parser';
import type { AnyStyle } from '../../types/rn.types';
import { ParseCssDimensions } from '../dimensions.parser';

export const ParseSkewValue = sequenceOf([
  choice([literal('skewX'), literal('skewY')]),
  betweenParens(ParseCssDimensions),
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
