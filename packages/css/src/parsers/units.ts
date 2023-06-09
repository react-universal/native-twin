import type { CssValueDimensionNode } from '../types';
import {
  parseChar,
  parseChoice,
  parseDigit,
  parseLiteral,
  parseMany,
  parseSequenceOf,
  possibly,
} from './common';

export const parseValidDimensionUnit = parseChoice([
  parseLiteral('em'),
  parseLiteral('rem'),
  parseLiteral('px'),
  parseLiteral('%'),
  parseLiteral('vh'),
  parseLiteral('vw'),
  parseLiteral('deg'),
  parseLiteral('ex'),
  parseLiteral('in'),
  parseLiteral('cn'),
  parseLiteral('mm'),
  parseLiteral('pt'),
  parseLiteral('px'),
  parseLiteral('vh'),
  parseLiteral('vw'),
]);

export const parseDimensionsValue = parseSequenceOf([
  parseMany(parseChoice([parseDigit, parseChar('.'), parseChar('-')])),
  parseValidDimensionUnit,
  possibly(parseChar(')')),
]).map(
  (x): CssValueDimensionNode => ({
    type: 'dimensions',
    value: x[0].join(''),
    unit: x[1],
  }),
);
