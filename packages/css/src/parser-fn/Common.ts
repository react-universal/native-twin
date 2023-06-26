import * as P from './Parser';
import * as S from './Strings';

export const betweenBrackets = P.between(S.char('{'))(S.char('}'));
export const separatedBySpace = P.separatedBy(S.whitespace);

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

export const DeclarationUnit = P.choice([
  P.choice([emUnitToken, remUnitToken]).map(() => 'rem'),
  P.choice([pxUnitToken, cnUnitToken, exUnitToken, inUnitToken]).map(() => 'px'),
  P.choice([vhUnitToken, vwUnitToken]).map((x) => x),
  percentageUnitToken,
  degUnitToken,
]);
