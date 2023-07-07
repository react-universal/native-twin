import type { AnyStyle } from '../../../../types/rn.types';
import { choice } from '../../../common/choice.parser';
import { betweenParens } from '../../../common/composed.parsers';
import { sequenceOf } from '../../../common/sequence-of';
import { literal } from '../../../common/string.parser';
import { ParseCssDimensions } from '../../dimensions.parser';

export const ParseRotateValue = sequenceOf([
  choice([literal('rotateX'), literal('rotateY'), literal('rotateZ'), literal('rotate')]),
  betweenParens(ParseCssDimensions),
]).map(([key, value]): AnyStyle['transform'] => {
  if (key == 'rotateX') {
    return [{ rotateX: `${value}` }];
  }
  if (key == 'rotateY') {
    return [{ rotateY: `${value}` }];
  }

  if (key == 'rotateZ') {
    return [{ rotateZ: `${value}` }];
  }

  return [{ rotate: `${value}` }];
});
