import { choice } from '../parsers/choice.parser';
import { whitespaceSurrounded } from '../parsers/composed.parsers';
import { many1 } from '../parsers/many.parser';
import { sequenceOf } from '../parsers/sequence-of';
import { char, ident, letters } from '../parsers/string.parser';

// subsequent-sibling combinator
// '~' === '\u{007E}'; -> true
// any element
// '*' === '\u{002A}'; -> true
// an element of type E
// 'E' === '\u{0045}';

const mapToken =
  <A extends string, B>(type: A) =>
  (value: B) => ({
    type,
    value,
  });

const ParseSelectorTags = ident.map(mapToken('IDENT'));
const ParsePseudoClass = sequenceOf([char(':'), letters]).map((x) =>
  mapToken('PSEUDO')(x.join('')),
);

const ParseSelectorCombinator = whitespaceSurrounded(
  choice([char('>'), char('~'), char('+')]),
).map(mapToken('COMBINATOR'));

const SelectorClass = sequenceOf([char('.'), ident]).map((x) => mapToken('CLASS')(x.join('')));

export const ParseSelectorStrict = many1(
  choice([SelectorClass, ParsePseudoClass, ParseSelectorTags, ParseSelectorCombinator]),
);
