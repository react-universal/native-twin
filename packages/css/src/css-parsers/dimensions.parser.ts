import { resolveCssCalc } from '../helpers';
import { composed, number, parser, string } from '../lib';
import type { AstDimensionsNode } from '../types';

const emUnitToken = string.literal('em');
const remUnitToken = string.literal('rem');
const pxUnitToken = string.literal('px');
const percentageUnitToken = string.literal('%');
const cnUnitToken = string.literal('cn');
const vhUnitToken = string.literal('vh');
const vwUnitToken = string.literal('vw');
const degUnitToken = string.literal('deg');
const exUnitToken = string.literal('ex');
const inUnitToken = string.literal('in');

export const DeclarationUnit = parser.choice([
  parser.choice([emUnitToken, remUnitToken]).map(() => 'rem'),
  parser.choice([pxUnitToken, cnUnitToken, exUnitToken, inUnitToken]).map(() => 'px'),
  parser.choice([vhUnitToken, vwUnitToken]).map((x) => x),
  percentageUnitToken,
  degUnitToken,
]);

export const CssUnitlessDimensionParser = number.float.map(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    value: parseFloat(x),
    units: 'none',
  }),
);

export const CssUnitDimensionsParser = parser.sequenceOf([number.float, DeclarationUnit]).map(
  (x): AstDimensionsNode => ({
    type: 'DIMENSIONS',
    value: parseFloat(x[0]),
    units: x[1] ?? 'none',
  }),
);

export const CssDimensionsParser = parser.choice([
  CssUnitDimensionsParser,
  CssUnitlessDimensionParser,
]);

export const calcKeyword = string.literal('calc');

export const CssCalcParser = parser
  .sequenceOf([
    calcKeyword,
    string.char('('),
    CssDimensionsParser,
    parser.between(string.whitespace)(string.whitespace)(composed.parseMathOperatorSymbol),
    CssDimensionsParser,
    string.char(')'),
  ])
  .map((x): AstDimensionsNode => {
    return resolveCssCalc(x[2], x[3], x[4]);
  });
