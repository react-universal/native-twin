import * as P from '@universal-labs/css/parser';
import { matchArbitrary, matchTwSegment } from '../common.parsers';

const matchColorModifier = P.sequenceOf([
  P.char('/'),
  P.choice([P.digits, matchArbitrary]),
]).map((x) => ({
  modifier: x[1],
}));

// const matchBackgroundColorRule = P.sequenceOf([
//   P.literal('bg-'),
//   P.many1(P.choice([matchTwSegment, P.char('-')])),
//   P.maybe(P.choice([matchColorModifier, matchArbitrary])),
// ]);

// const matchTextColor = P.sequenceOf([
//   P.literal('text-'),
//   P.many1(P.choice([matchTwSegment, P.char('-')])),
//   P.maybe(P.choice([matchColorModifier, matchArbitrary])),
// ]);

export const createColorParsers = (prefixes: string[], colors: string[]) => {
  return P.sequenceOf([
    P.choice(prefixes.map((x) => P.literal(x))),
    P.choice(colors.map((x) => P.literal(x))),
    P.maybe(P.choice([matchColorModifier, matchArbitrary])),
  ]);
};

export const matchOpacityRule = P.sequenceOf([P.literal('opacity-'), matchTwSegment]);
