import { between } from '../lib/common/between.parser';
import { choice } from '../lib/common/choice.parser';
import { separatedBy } from '../lib/common/separated-by.parser';
import * as S from '../lib/string.parser';

export const betweenBrackets = between(S.char('{'))(S.char('}'));
export const betweenParens = between(S.char('('))(S.char(')'));
export const separatedBySpace = separatedBy(S.whitespace);
export const separatedByComma = separatedBy(S.char(', '));

export const mapToTokenNode = <T, N extends string>(type: N, value: T) => ({
  type,
  ...value,
});

const emUnitToken = S.literal('em');
const remUnitToken = S.literal('rem');
const pxUnitToken = S.literal('px');
const percentageUnitToken = S.literal('%');
const cnUnitToken = S.literal('cn');
const vhUnitToken = S.literal('vh');
const vwUnitToken = S.literal('vw');
const degUnitToken = S.literal('deg');
const exUnitToken = S.literal('ex');
const inUnitToken = S.literal('in');

export const DeclarationUnit = choice([
  choice([emUnitToken, remUnitToken]).map(() => 'rem'),
  choice([pxUnitToken, cnUnitToken, exUnitToken, inUnitToken]).map(() => 'px'),
  choice([vhUnitToken, vwUnitToken]).map((x) => x),
  percentageUnitToken,
  degUnitToken,
]);

const rgbaUnit = S.literal('rgba');
const hslUnit = S.literal('hsl');

export const DeclarationColor = choice([rgbaUnit, hslUnit]);

export const translateKeyword = S.literal('translate');
export const calcKeyword = S.literal('calc');

const plusOperator = S.char('+');
const minusOperator = S.char('-');
const multiplyOperator = S.char('*');
const divisionOperator = S.char('/');
export const MathOperatorSymbol = choice([
  plusOperator,
  minusOperator,
  multiplyOperator,
  divisionOperator,
]);
