import { CSS_COLORS } from './constants/css.colors';
import { Parser, updateResult } from './parsers/Parser';
import {
  parseChar,
  parseEveryCharUntil,
  parseSequenceOf,
  parseChoice,
  parseMany,
} from './parsers/common';
import { parseFlexStyle } from './parsers/flex';
import { parseFontFamily } from './parsers/font';
import { parseCalcValue } from './parsers/maths';
import { parseTranslateDeclaration } from './parsers/transform';
import { parseDimensionsValue } from './parsers/units';
import type { CssDeclarationNode, CssValueRawNode } from './types';

const parseCssDeclarationPropertyValue = (x: [string, string]) => {
  const property = x[0];
  return new Parser((state) => {
    console.debug('STATE: ', property, { state, x });
    if (state.isError) return state;
    if (
      property.includes('color') ||
      state.target.includes('rgb') ||
      state.target.includes('#') ||
      state.target.includes('hsl') ||
      Object.keys(CSS_COLORS).includes(state.target)
    ) {
      const parser = parseEveryCharUntil(parseChoice([parseChar(';')])).map(
        (x): CssValueRawNode => ({
          type: 'raw',
          value: x,
        }),
      );
      const nextState = parser.p(state);
      return updateResult(nextState, [...x, nextState.result]);
    }

    if (property === 'font-family') {
      const fontState = parseFontFamily.p(state);
      return updateResult(fontState, [...x, fontState.result[0]]);
    }
    const parser = parseSequenceOf([
      parseChoice([
        parseDimensionsValue,
        parseCalcValue,
        parseTranslateDeclaration,
        parseFlexStyle,
      ]),
      parseMany(parseChoice([parseChar(';')])),
    ]);
    let nextState = parser.p(state);
    if (nextState.isError) {
      return state;
    }
    return updateResult(nextState, [...x, nextState.result[0]]);
  });
};

export const parseCssDeclaration = parseSequenceOf([
  parseEveryCharUntil(parseChar(':')),
  parseChar(':'),
])
  .chain(parseCssDeclarationPropertyValue)
  .map((x): CssDeclarationNode => {
    console.debug('FINAL_DECL: ', x);
    return {
      type: 'declaration',
      property: x[0],
      value: x[2],
    };
  });
