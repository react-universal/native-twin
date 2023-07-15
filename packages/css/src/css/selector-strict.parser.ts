import { choice } from '../parsers/choice.parser';
import { coroutine } from '../parsers/coroutine.parser';
import { getData, setData } from '../parsers/data.parser';
import { many, many1 } from '../parsers/many.parser';
import { peek } from '../parsers/peek.parser';
import { skip } from '../parsers/skip.parser';
import { char, ident, literal } from '../parsers/string.parser';
import { SelectorPayload } from '../types/css.types';

const mapToken =
  <A extends string>(type: A) =>
  <B>(value: B) => ({
    type,
    value,
  });

const ChildPseudoClasses = choice([
  literal('first-child'),
  literal('last-child'),
  literal('even'),
  literal('odd'),
]);

const PlatformPseudoClasses = choice([
  literal('web'),
  literal('native'),
  literal('ios'),
  literal('android'),
]);

const PointerPseudoClasses = choice([literal('hover'), literal('focus'), literal('active')]);
const GroupPointerPseudoClasses = choice([
  literal('group-hover'),
  literal('group-focus'),
  literal('group-active'),
]);

const AppearancePseudoClasses = choice([literal('dark'), literal('light')]);

const ParseSelectorClassName = many1(
  choice([ident, skip(char('\\')), char('['), char(']'), char('%')]),
).map((x) => x.join(''));

const ParseSelectorPart = choice([
  ChildPseudoClasses.map(mapToken('CHILD_PSEUDO_CLASS')),
  PointerPseudoClasses.map(mapToken('POINTER_PSEUDO_CLASS')),
  GroupPointerPseudoClasses.map(mapToken('GROUP_PSEUDO_CLASS')),
  PlatformPseudoClasses.map(mapToken('PLATFORM_PSEUDO_CLASS')),
  AppearancePseudoClasses.map(mapToken('APPEARANCE_PSEUDO_CLASS')),
  ParseSelectorClassName.map(mapToken('IDENT_PSEUDO_CLASS')),
]);

export const ParseSelectorStrict = coroutine((run) => {
  const token = parseNextPart();
  const selectorToken = mapToken('SELECTOR');
  const data = run(getData);
  run(setData({ ...data }));

  return selectorToken(token);

  function parseNextPart(
    result: SelectorPayload = { pseudoSelectors: [], selectorList: [], group: 'base' },
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
      if (!result.selectorList.includes(nextPart.value)) {
        result.selectorList.push(nextPart.value);
      }
    } else {
      if (!result.pseudoSelectors.includes(nextPart.value)) {
        result.pseudoSelectors.push(nextPart.value);
      }
    }
    if (result.group == 'base') {
      if (nextPart.type == 'CHILD_PSEUDO_CLASS') {
        switch (nextPart.value) {
          case 'even':
            result.group = 'even';
            break;
          case 'first-child':
            result.group = 'first';
            break;
          case 'last-child':
            result.group = 'last';
            break;
          case 'odd':
            result.group = 'odd';
            break;
        }
      }
      if (nextPart.type == 'GROUP_PSEUDO_CLASS') {
        result.group = 'group';
      }
      if (nextPart.type == 'POINTER_PSEUDO_CLASS') {
        result.group = 'pointer';
      }
    }
    return parseNextPart(result);
  }
});
