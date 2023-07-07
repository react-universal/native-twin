import type { AnyStyle } from '../../../../types/rn.types';
import { choice } from '../../../common/choice.parser';
import { betweenParens } from '../../../common/composed.parsers';
import { sequenceOf } from '../../../common/sequence-of';
import { literal } from '../../../common/string.parser';
import { ParseCssDimensions } from '../../dimensions.parser';

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
