import { choice } from '../../parsers/choice.parser';
import { betweenParens, separatedByComma } from '../../parsers/composed.parsers';
import { float } from '../../parsers/number.parser';
import { sequenceOf } from '../../parsers/sequence-of';
import { literal } from '../../parsers/string.parser';

export const ParseCssColor = sequenceOf([
  choice([literal('rgba'), literal('hsl'), literal('#')]),
  betweenParens(separatedByComma(float)),
]).map((x) => {
  return `${x[0]}(${x[1]})`;
});
