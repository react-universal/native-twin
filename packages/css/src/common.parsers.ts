import * as P from '@universal-labs/arc-parser';

const regexIdent = /^[_a-z0-9A-Z-]+/;
export const ident: P.Parser<string> = P.regex(regexIdent);

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

export const parseDeclarationUnit = P.choice([
  P.literal('px'),
  P.literal('%'),
  P.literal('em'),
  P.literal('rem'),
  P.literal('deg'),
  P.literal('vh'),
  P.literal('vw'),
  P.literal('rad'),
  P.literal('turn'),
  P.choice([
    P.literal('pc'),
    P.literal('cn'),
    P.literal('ex'),
    P.literal('in'),
    P.literal('pt'),
    P.literal('cm'),
    P.literal('mm'),
    P.literal('Q'),
  ]),
]);

export const parseDeclarationProperty = P.sequenceOf([ident, P.char(':')]).map((x) => x[0]);
