import * as P from '@universal-labs/css/parser';

const parseTwSegment = /^[a-z0-9A-Z]+/;

export const matchTwSegment = P.regex(parseTwSegment);
export const matchAllTwSegments = P.separatedBy(P.char('-'))(matchTwSegment);
export const matchArbitrary = P.between(P.char('['))(P.char(']'))(P.everyCharUntil(']')).map(
  (x) => ({
    isArbitrary: true,
    value: x,
  }),
);

export const matchAxisXYSegments = P.choice([P.char('x'), P.char('y')]);
export const matchLongTRBLSegment = P.choice([
  P.literal('top'),
  P.literal('right'),
  P.literal('bottom'),
  P.literal('left'),
]);

export const matchMaybeNegative = P.maybe(P.char('-')).map((x) => ({
  igNegative: !!x,
}));

export function createChoice(options: string[]) {
  return P.choice(options.map((x) => P.literal(x)));
}
