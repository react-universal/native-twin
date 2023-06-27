import type { AstRuleNode } from '../../types';
import * as P from '../Parser';
import { DeclarationToken } from './Declaration.token';
import { SelectorToken } from './Selector.token';

export const CssRuleToken = P.sequenceOf([SelectorToken, DeclarationToken]).map(
  (x): AstRuleNode => ({
    type: 'RULE',
    selector: x[0],
    declarations: x[1],
  }),
);
