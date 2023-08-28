import * as P from '@universal-labs/css/parser';
import { matchArbitrary, matchTwSegment } from '../common.parsers';
import { MaybeColorValue } from '../../types/theme.types';

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

export function flattenColorPalette(
  colors: Record<string, MaybeColorValue>,
  path: string[] = [],
) {
  const flatten: Record<string, MaybeColorValue> = {};

  for (const key in colors) {
    const value = colors[key];

    let keyPath = [...path, key];
    if (value) {
      flatten[keyPath.join('-')] = value;
    }

    if (key == 'DEFAULT') {
      keyPath = path;
      if (value) {
        flatten[path.join('-')] = value;
      }
    }

    if (typeof value == 'object') {
      Object.assign(flatten, flattenColorPalette(value, keyPath));
    }
  }

  return flatten;
}
