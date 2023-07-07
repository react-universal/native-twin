import type { Parser } from './Parser';
import { between } from './between.parser';
import { choice } from './choice.parser';
import { separatedBy } from './separated-by.parser';
import { sequenceOf } from './sequence-of';
import { char, ident, literal, optionalWhitespace, whitespace } from './string.parser';

export const betweenBrackets = between(char('{'))(char('}'));

export const betweenParens = between(char('('))(char(')'));
export const separatedBySpace = separatedBy(whitespace);
export const separatedByOptionalSpace = separatedBy(optionalWhitespace);

export const whitespaceSurrounded = <T>(parser: Parser<T>) =>
  between(optionalWhitespace)(optionalWhitespace)(parser);

export const separatedByComma = separatedBy(char(','));

export const separatedBySemicolon = separatedBy(char(';'));

const plusOperator = char('+');
const minusOperator = char('-');
const multiplyOperator = char('*');
const divisionOperator = char('/');

export const parseMathOperatorSymbol = choice([
  plusOperator,
  minusOperator,
  multiplyOperator,
  divisionOperator,
]);

export const parseDeclarationUnit = choice([
  literal('px'),
  literal('%'),
  literal('em'),
  literal('rem'),
  literal('deg'),
  literal('vh'),
  literal('vw'),
  literal('rad'),
  literal('turn'),
  choice([
    literal('pc'),
    literal('cn'),
    literal('ex'),
    literal('in'),
    literal('pt'),
    literal('cm'),
    literal('mm'),
    literal('Q'),
  ]),
]);

export const parseDeclarationProperty = sequenceOf([ident, char(':')]).map((x) => x[0]);
