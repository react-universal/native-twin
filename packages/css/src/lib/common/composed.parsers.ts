import { between } from './between.parser';
import { choice } from './choice.parser';
import { separatedBy } from './separated-by.parser';
import { char, whitespace } from './string.parser';

export const betweenBrackets = between(char('{'))(char('}'));
export const betweenParens = between(char('('))(char(')'));
export const separatedBySpace = separatedBy(whitespace);
export const separatedByComma = separatedBy(char(', '));

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
