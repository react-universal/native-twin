import { choice } from '../parsers/choice.parser';
import { sequenceOf } from '../parsers/sequence-of';
import { char, literal } from '../parsers/string.parser';
import { cornerMap, directionMap } from './mappings';
import { asArray, keysOf } from './tailwind.utils';

export const edgesParser = sequenceOf([
  choice([literal('x'), literal('y'), literal('t'), literal('l'), literal('b'), literal('r')]),
  char('-'),
]).map((x) => {
  return directionMap[x[0]];
});

export const transform2dParser = sequenceOf([
  choice([literal('x'), literal('y')]),
  char('-'),
]).map((x) => {
  return asArray(x[0].toUpperCase());
});

export const cornersParser = choice(
  keysOf(cornerMap).map((x) => sequenceOf([literal(x), char('-')])),
).map((x: [keyof typeof cornerMap, string]) => {
  return cornerMap[x[0]];
});

export const gapParser = sequenceOf([choice([literal('x'), literal('y')]), char('-')]).map(
  (x) => {
    return asArray(
      {
        x: 'column',
        y: 'row',
      }[x[0]],
    );
  },
);
