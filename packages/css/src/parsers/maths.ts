import { parseWhiteSpace } from './css.combinators';
import type { CssValueCalcNode } from '../types';
import { parseChar, parseChoice, parseLiteral, parseSequenceOf } from './common';
import { parseDimensionsValue } from './units';

export const parseCalcValue = parseChoice([
  parseSequenceOf([
    parseLiteral('calc'),
    parseChar('('),
    parseDimensionsValue,
    parseWhiteSpace,
    parseChoice([parseChar('*'), parseChar('+'), parseChar('/'), parseChar('-')]),
    parseWhiteSpace,
    parseDimensionsValue,
    parseChar(')'),
  ]),
])
  .errorMap((x) => {
    console.log('CALC_ERROR: ', x);
    return x;
  })
  .map((x): CssValueCalcNode => {
    console.log('CALC: ', x);
    return {
      left: x[2],
      right: x[6],
      operation: x[4] as any,
      type: 'calc',
    };
  });
