import * as P from '@native-twin/arc-parser';
import { ParseCssDimensions } from '../dimensions.parser';
import { AnyStyle } from '../../../react-native/rn.types';

export const ParseRotateValue = P.sequenceOf([
  P.choice([P.literal('rotateX'), P.literal('rotateY'), P.literal('rotateZ'), P.literal('rotate')]),
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
