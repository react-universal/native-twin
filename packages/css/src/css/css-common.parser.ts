import * as P from '@native-twin/arc-parser';
import { CSSUnits, ParserToken } from './css.types';
import { cssUnitToken, floatToken, numericToken } from './tokens';

export const parseIntegerToken = P.digits.map(numericToken);
export const parseFloatToken = P.float.map(floatToken);

const plusOperator = P.char('+');
const minusOperator = P.char('-');
const multiplyOperator = P.char('*');
const divisionOperator = P.char('/');

export const parseMathOperatorSymbol = P.choice([
  plusOperator,
  minusOperator,
  multiplyOperator,
  divisionOperator,
]);

export const cssValueUnitParser = P.choice([
  P.literal('px'),
  P.literal('%'),
  P.literal('em'),
  P.literal('rem'),
  P.literal('deg'),
  P.literal('vh'),
  P.literal('vw'),
  P.literal('rad'),
  P.literal('turn'),
  P.literal('pc'),
  P.literal('cn'),
  P.literal('ex'),
  P.literal('in'),
  P.literal('pt'),
  P.literal('cm'),
  P.literal('mm'),
  P.literal('Q'),
]).map((x): ParserToken<'UNIT', CSSUnits> => cssUnitToken(x));

export const dimensionUnitParser = P.sequenceOf([parseFloatToken]);

export const declarationValueWithUnitParser = P.sequenceOf([
  P.float,
  P.maybe(cssValueUnitParser),
]);
