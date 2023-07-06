import type { Parser } from '../Parser';
import { between } from './between.parser';
import { choice } from './choice.parser';
import { separatedBy } from './separated-by.parser';
import { sequenceOf } from './sequence-of';
import { char, ident, literal, optionalWhitespace, whitespace } from './string.parser';

export const betweenBrackets = between(char('{'))(char('}'));

export const betweenParens = between(char('('))(char(')'));
export const separatedBySpace = separatedBy(whitespace);

export const whitespaceSurrounded = <T>(parser: Parser<T>) =>
  between(optionalWhitespace)(optionalWhitespace)(parser);

export const separatedByComma = separatedBy(char(', '));

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
  literal('em'),
  literal('rem'),
  literal('px'),
  literal('%'),
  literal('cn'),
  literal('vh'),
  literal('vw'),
  literal('deg'),
  literal('rad'),
  literal('turn'),
  literal('ex'),
  literal('in'),
]);

export const parseDeclarationProperty = sequenceOf([ident, char(':')]).map((x) => x[0]);
