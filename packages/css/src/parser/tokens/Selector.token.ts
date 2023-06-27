import { getSelectorGroup } from '../../interpreter/utils';
import type { AstSelectorNode } from '../../types';
import * as P from '../Parser';
import * as S from '../Strings';

export const SelectorValidChars = P.everyCharUntil('{');

export const SelectorToken = P.sequenceOf([S.char('.'), SelectorValidChars]).map(
  (x): AstSelectorNode => {
    const value = x[0] + x[1];
    return {
      type: 'SELECTOR',
      value,
      group: getSelectorGroup(value),
    };
  },
);
