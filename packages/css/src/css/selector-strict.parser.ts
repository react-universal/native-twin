import { choice } from '../parsers/choice.parser';
import { coroutine } from '../parsers/coroutine.parser';
import { many } from '../parsers/many.parser';
import { peek } from '../parsers/peek.parser';
import { skip } from '../parsers/skip.parser';
import { char, ident, literal } from '../parsers/string.parser';
import { SelectorPayload } from '../types/css.types';

const mapToken =
  <A extends string, B>(type: A) =>
  (value: B) => ({
    type,
    value,
  });

const ChildPseudoClasses = choice([
  literal('first-child'),
  literal('last-child'),
  literal('only-child'),
]);

const PointerPseudoClasses = choice([literal('hover'), literal('focus'), literal('active')]);
const GroupPointerPseudoClasses = choice([
  literal('group-hover'),
  literal('group-focus'),
  literal('group-active'),
]);

const ParseSelectorClassName = ident;

const ParseSelectorPart = choice([
  ChildPseudoClasses.map(mapToken('CHILD_PSEUDO_CLASS')),
  PointerPseudoClasses.map(mapToken('POINTER_PSEUDO_CLASS')),
  GroupPointerPseudoClasses.map(mapToken('GROUP_PSEUDO_CLASS')),
  ParseSelectorClassName.map(mapToken('IDENT_PSEUDO_CLASS')),
]);

export const ParseSelectorStrict = coroutine((run) => {
  const token = parseNextPart();

  return mapToken('SELECTOR')(token);

  function parseNextPart(
    result: SelectorPayload = { pseudoSelectors: [], selectorList: [] },
  ): SelectorPayload {
    const nextToken = run(peek);
    if (nextToken == '{') {
      return result;
    }
    if (nextToken == '\\') {
      run(skip(many(char('\\'))));
      return parseNextPart(result);
    }
    if (nextToken == ':') {
      run(skip(char(':')));
    }

    if (nextToken == '.') {
      run(skip(char('.')));
    }
    if (nextToken == '#') {
      run(skip(char('#')));
    }
    const nextPart = run(ParseSelectorPart);
    if (nextPart.type == 'IDENT_PSEUDO_CLASS') {
      result.selectorList.push(nextPart.value);
    } else {
      result.pseudoSelectors.push(nextPart.value);
    }
    return parseNextPart(result);
  }
});
