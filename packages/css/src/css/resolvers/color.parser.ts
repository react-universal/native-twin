import * as P from '@universal-labs/arc-parser';
import { ident } from '../../common.parsers';
import { CSS_COLORS } from '../../constants/css.colors';

export const ParseCssColor = P.choice([
  P.sequenceOf([
    P.choice([P.literal('rgba'), P.literal('hsl')]),
    P.betweenParens(P.separatedByComma(P.float)),
  ]).map((x) => {
    return `${x[0]}(${x[1]})`;
  }),
  P.sequenceOf([P.literal('#'), ident]).map((x) => {
    return `${x[0]}(${x[1]})`;
  }),
  ...CSS_COLORS.map((i) => P.literal(i)),
]);
