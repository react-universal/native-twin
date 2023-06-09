import type { CssTransformValueNode, CssValueDimensionNode } from '../types';
import { Parser, updateResult } from './Parser';
import {
  parseChar,
  parseChoice,
  parseDigit,
  parseEveryCharUntil,
  parseLiteral,
  parseMany,
  parseSeparatedBy,
  parseSequenceOf,
} from './common';
import { parseDimensionsValue } from './units';

const parseCommaSeparated = parseSeparatedBy(parseChar(','));

const chainTranslateParser = (x: string) => {
  return new Parser<Pick<CssTransformValueNode, 'x' | 'y' | 'z'>>((state) => {
    if (x.includes(',')) {
      const nextState = parseCommaSeparated(
        parseSequenceOf([
          parseMany(parseChoice([parseChar(' ')])),
          parseChoice([
            parseDimensionsValue,
            parseMany(parseDigit).map(
              (x): CssValueDimensionNode => ({
                value: x.join(''),
                type: 'dimensions',
                unit: 'none',
              }),
            ),
          ]),
        ]).map((x) => x[1]),
      )
        .map((x) => {
          return {
            x: x[0],
            y: x[1],
          };
        })
        .run(x);
      if (nextState.isError) return state;
      return updateResult(state, nextState.result);
    }

    const nextState = parseChoice([
      parseDimensionsValue,
      parseMany(parseDigit).map(
        (x): CssValueDimensionNode => ({
          value: x.join(''),
          type: 'dimensions',
          unit: 'none',
        }),
      ),
    ]).run(x);
    if (nextState.isError) return state;

    return updateResult(state, {
      x: nextState.result,
    });
  });
};

export const parseTranslateDeclaration = parseSequenceOf([
  parseLiteral('translate'),
  parseChar('('),
  parseEveryCharUntil(parseChar(')')).chain(chainTranslateParser),
  parseChar(')'),
]).map(
  (x): CssTransformValueNode => ({
    dimension: '2d',
    type: 'transform',
    ...x[2],
  }),
);
