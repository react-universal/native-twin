import { CSS_COLORS } from '../../constants/css.colors';
import { choice } from '../../parsers/choice.parser';
import { betweenParens, separatedByComma } from '../../parsers/composed.parsers';
import { float } from '../../parsers/number.parser';
import { sequenceOf } from '../../parsers/sequence-of';
import { ident, literal } from '../../parsers/string.parser';

export const ParseCssColor = choice([
  sequenceOf([
    choice([literal('rgba'), literal('hsl')]),
    betweenParens(separatedByComma(float)),
  ]).map((x) => {
    return `${x[0]}(${x[1]})`;
  }),
  sequenceOf([literal('#'), ident]).map((x) => {
    return `${x[0]}(${x[1]})`;
  }),
  ...Object.keys(CSS_COLORS).map((i) => literal(i)),
]);
