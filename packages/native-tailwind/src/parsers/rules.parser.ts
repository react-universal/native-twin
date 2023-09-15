import * as P from '@universal-labs/css/parser';
import { asArray, keysOf } from '../utils/helpers';
import { cornerMap, directionMap } from '../utils/mappings';

export const edgesParser = P.sequenceOf([
  P.choice([
    P.literal('x'),
    P.literal('y'),
    P.literal('t'),
    P.literal('l'),
    P.literal('b'),
    P.literal('r'),
  ]),
  P.char('-'),
]).map((x) => {
  return directionMap[x[0]];
});

export const cornersParser = P.choice(
  keysOf(cornerMap).map((x) => P.sequenceOf([P.literal(x), P.char('-')])),
).map((x: [keyof typeof cornerMap, string]) => {
  return cornerMap[x[0]];
});

export const gapParser = P.sequenceOf([
  P.choice([P.literal('x'), P.literal('y')]),
  P.char('-'),
]).map((x) => {
  return asArray(
    {
      x: 'column',
      y: 'row',
    }[x[0]],
  );
});
