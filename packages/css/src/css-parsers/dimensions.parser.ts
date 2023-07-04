import { evaluateDimensionsNode } from '../evaluators/dimensions.evaluator';
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

export const CssDimensionsParser = parser
  .sequenceOf([number.float, parser.maybe(DeclarationUnit)])
  .mapFromData(
    (x): AstDimensionsNode => ({
      type: 'DIMENSIONS',
      units: x.result[1] ?? 'none',
      value: parseFloat(x.result[0]),
    }),
  );

const calcKeyword = string.literal('calc');

export const CssCalcParser = parser
  .sequenceOf([
    calcKeyword,
    string.char('('),
    CssDimensionsParser,
    parser.between(string.whitespace)(string.whitespace)(composed.parseMathOperatorSymbol),
    CssDimensionsParser,
    string.char(')'),
  ])
  .mapFromData((x) => {
    return evaluateDimensionsNode(
      resolveCssCalc(x.result[2], x.result[3], x.result[4]),
      x.data,
    );
  });
