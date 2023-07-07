import { choice } from '../../../common/choice.parser';
import { betweenParens, separatedByComma } from '../../../common/composed.parsers';
import { float } from '../../../common/number.parser';
import { sequenceOf } from '../../../common/sequence-of';
import { literal } from '../../../common/string.parser';

export const ParseCssColor = sequenceOf([
  choice([literal('rgba'), literal('hsl'), literal('#')]),
  betweenParens(separatedByComma(float)),
]).map((x) => {
  return `${x[0]}(${x[1]})`;
});
