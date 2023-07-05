import { sequenceOf } from '../common/sequence-of';
import { char, everyCharUntil } from '../common/string.parser';
import { mapSelector } from '../utils.parser';

/*
 ************ SELECTORS ***********
 */
// subsequent-sibling combinator
// '~' === '\u{007E}'; -> true

export const ParseCssSelector = sequenceOf([char('.'), everyCharUntil('{')])
  .map((x) => x[0] + x[1])
  .map(mapSelector);
