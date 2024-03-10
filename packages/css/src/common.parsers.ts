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

export const parseDeclarationProperty = P.sequenceOf([ident, P.char(':')]).map((x) => x[0]);
