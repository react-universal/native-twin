import { resolveCssCalc } from '../helpers';
import { composed, number, parser, string } from '../lib';
import type { AstDimensionsNode } from '../types';

export const DeclarationUnit = parser.choice([
  string.literal('em'),
  string.literal('rem'),
  string.literal('px'),
  string.literal('%'),
  string.literal('cn'),
  string.literal('vh'),
  string.literal('vw'),
  string.literal('deg'),
  string.literal('ex'),
  string.literal('in'),
]);

export const CssDimensionsParser = parser.recursiveParser(() =>
  parser.choice([DimensionWithUnitsParser, CssCalcParser]),
);

const DimensionWithUnitsParser = parser
  .sequenceOf([number.float, parser.maybe(DeclarationUnit)])
  .mapFromData(
    (x): AstDimensionsNode => ({
      type: 'DIMENSIONS',
      units: x.result[1] ?? 'none',
      value: parseFloat(x.result[0]),
    }),
  );

export const CssCalcParser = parser
  .sequenceOf([
    string.literal('calc'),
    string.char('('),
    DimensionWithUnitsParser,
    parser.between(string.whitespace)(string.whitespace)(composed.parseMathOperatorSymbol),
    DimensionWithUnitsParser,
    string.char(')'),
  ])
  .mapFromData((x) => {
    return resolveCssCalc(x.result[2], x.result[3], x.result[4]);
  });
