import * as P from '@native-twin/arc-parser';

export const ParseCssColor = P.sequenceOf([
  P.choice([P.literal('rgba'), P.literal('hsl'), P.literal('#')]),
  P.betweenParens(P.separatedByComma(P.float)),
]).map((x) => {
  return `${x[0]}(${x[1]})`;
});
