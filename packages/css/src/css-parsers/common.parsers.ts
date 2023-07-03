import { parser, string } from '../lib';

export const betweenBrackets = parser.between(string.char('{'))(string.char('}'));
export const betweenParens = parser.between(string.char('('))(string.char(')'));
export const separatedBySpace = parser.separatedBy(string.whitespace);
export const separatedByComma = parser.separatedBy(string.char(', '));

export const mapToTokenNode = <T, N extends string>(type: N, value: T) => ({
  type,
  ...value,
});

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

const rgbaUnit = string.literal('rgba');
const hslUnit = string.literal('hsl');

export const DeclarationColor = parser.choice([rgbaUnit, hslUnit]);

export const translateKeyword = string.literal('translate');
export const calcKeyword = string.literal('calc');

const plusOperator = string.char('+');
const minusOperator = string.char('-');
const multiplyOperator = string.char('*');
const divisionOperator = string.char('/');
export const MathOperatorSymbol = parser.choice([
  plusOperator,
  minusOperator,
  multiplyOperator,
  divisionOperator,
]);
