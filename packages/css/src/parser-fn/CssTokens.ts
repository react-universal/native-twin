import { getSelectorGroup } from '../interpreter/utils';
import type { AstRuleNode, AstSelectorNode } from '../types';
import * as P from './Parser';
import * as S from './Strings';
import { DeclarationToken } from './tokens/Declaration.token';

const SelectorToken = P.sequenceOf([S.char('.'), S.ident]).map((x): AstSelectorNode => {
  const value = x[0] + x[1];
  return {
    type: 'SELECTOR',
    value,
    group: getSelectorGroup(value),
  };
});

export const CssRuleToken = P.sequenceOf([SelectorToken, DeclarationToken]).map(
  (x): AstRuleNode => ({
    type: 'RULE',
    selector: x[0],
    declarations: x[1],
  }),
);
