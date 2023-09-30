import * as P from '@universal-labs/arc-parser';
import type { AnyStyle } from '../../types/rn.types';
import { ParseCssDimensions } from '../dimensions.parser';

export const ParseRotateValue = P.sequenceOf([
  P.choice([
    P.literal('rotateX'),
    P.literal('rotateY'),
    P.literal('rotateZ'),
    P.literal('rotate'),
  ]),
  P.betweenParens(ParseCssDimensions),
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
