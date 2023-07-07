import { choice } from '../common/choice.parser';
import { whitespaceSurrounded } from '../common/composed.parsers';
import { many1 } from '../common/many.parser';
import { sequenceOf } from '../common/sequence-of';
import { char, ident, letters } from '../common/string.parser';

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

const ParseSelector = many1(
  choice([SelectorClass, ParsePseudoClass, ParseSelectorTags, ParseSelectorCombinator]),
);

ParseSelector.run('.hover:bg-gray-200:hover', { deviceHeight: 0, deviceWidth: 0, rem: 16 }); //?
