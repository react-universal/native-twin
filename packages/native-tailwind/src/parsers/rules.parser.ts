import * as P from '@universal-labs/arc-parser';
import { cornerMap, directionMap } from '@universal-labs/css';
import { asArray, keysOf } from './tailwind.utils';

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

export const transform2dParser = P.sequenceOf([
  P.choice([P.literal('x'), P.literal('y')]),
  P.char('-'),
]).map((x) => {
  return asArray(x[0].toUpperCase());
});

export const transform3dParser = P.sequenceOf([
  P.choice([P.literal('x'), P.literal('y'), P.literal('z')]),
  P.char('-'),
]).map((x) => {
  return asArray(x[0].toUpperCase());
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
