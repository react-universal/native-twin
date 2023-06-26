import { getSelectorGroup } from '../interpreter/utils';
import * as C from './Common';
import * as P from './Parser';
import * as S from './Strings';
import { DeclarationToken } from './tokens/Declaration.token';

const SelectorToken = P.sequenceOf([S.char('.'), S.ident]).map((x) =>
  C.mapToTokenNode('SELECTOR', {
    value: x[0] + x[1],
    group: getSelectorGroup(x[0] + x[1]),
  }),
);

export const CssRuleToken = P.sequenceOf([SelectorToken, DeclarationToken]).map((x) =>
  C.mapToTokenNode('RULE', {
    selector: x[0],
    declaration: x[1],
  }),
);
