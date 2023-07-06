import type { SelectorGroup } from '../../css.types';
import { sequenceOf } from '../common/sequence-of';
import { char, everyCharUntil } from '../common/string.parser';

/*
 ************ SELECTORS ***********
 */
// subsequent-sibling combinator
// '~' === '\u{007E}'; -> true

export const ParseCssSelector = sequenceOf([char('.'), everyCharUntil('{')])
  .map((x) => x[0] + x[1])
  .map((selector: string) => ({
    group: getSelectorGroup(selector),
    value: selector,
  }));

const getSelectorGroup = (selector: string): SelectorGroup => {
  if (
    selector.includes('.group-hover') ||
    selector.includes('.group-active') ||
    selector.includes('.group-focus')
  ) {
    return 'group';
  }
  if (
    selector.includes(':hover') ||
    selector.includes(':active') ||
    selector.includes(':focus')
  ) {
    return 'pointer';
  }
  if (selector.includes('.first')) return 'first';
  if (selector.includes('.last')) return 'last';
  if (selector.includes('.odd')) return 'odd';
  if (selector.includes('.even')) return 'even';
  return 'base';
};
