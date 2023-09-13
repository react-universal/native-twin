import * as P from '@universal-labs/css/parser';
import type { RuleMeta } from '../types/config.types';
import type {
  ArbitrarySegmentToken,
  RuleHandlerToken,
  SegmentToken,
} from '../types/parser.types';
import { keysOf } from '../utils/helpers';
import { cornerMap, directionMap } from '../utils/mappings';

const classNameIdent = /^[a-z0-9A-Z-.]+/;
const arbitraryIdent = /^[a-z0-9A-Z-.#]+/;
const segmentParser = P.regex(classNameIdent).map(
  (x): SegmentToken => ({
    type: 'segment',
    value: x,
  }),
);

const maybeNegative = P.maybe(P.char('-')).map((x) => !!x);

const betweenSquareBrackets = P.between(P.char('['))(P.char(']'));
const arbitraryParser = betweenSquareBrackets(P.regex(arbitraryIdent)).map(
  (x): ArbitrarySegmentToken => ({
    type: 'arbitrary',
    value: x,
  }),
);

const edgesParser = P.sequenceOf([
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

const cornersParser = P.choice(
  keysOf(cornerMap).map((x) => P.sequenceOf([P.literal(x), P.char('-')])),
).map((x: [keyof typeof cornerMap, string]) => {
  return cornerMap[x[0]];
});

export function buildRuleHandlerParser(
  pattern: string,
  meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    prefix: undefined,
    suffix: undefined,
  },
): P.Parser<RuleHandlerToken> {
  let patternParser = P.literal(pattern);
  if (meta.feature == 'edges') {
    if (!pattern.endsWith('-')) {
      patternParser = P.sequenceOf([patternParser, P.maybe(P.char('-'))]).map((x) => x[0]);
    }
    return P.sequenceOf([
      maybeNegative,
      patternParser,
      P.maybe(edgesParser),
      P.choice([arbitraryParser, segmentParser]),
      P.endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }

  if (meta.feature == 'corners') {
    if (!pattern.endsWith('-')) {
      patternParser = P.sequenceOf([patternParser, P.maybe(P.char('-'))]).map((x) => x[0]);
    }
    return P.sequenceOf([
      maybeNegative,
      patternParser,
      P.maybe(cornersParser),
      P.choice([arbitraryParser, segmentParser]),
      P.endOfInput,
    ]).map((x) => ({
      segment: x[3],
      base: x[1],
      negative: x[0],
      suffixes: x[2] ?? [],
    }));
  }

  return P.sequenceOf([
    maybeNegative,
    patternParser,
    P.choice([arbitraryParser, segmentParser]),
    P.endOfInput,
  ]).map((x) => ({
    segment: x[2],
    base: x[1],
    suffixes: [],
    negative: x[0],
  }));
}
