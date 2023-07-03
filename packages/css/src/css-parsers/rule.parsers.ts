import { sequenceOf } from '../lib/sequence-of';
import type { AstRuleNode } from '../types';
import { DeclarationTokens } from './declaration.parsers';
import { SelectorToken } from './selector.parsers';

export const CssRuleToken = sequenceOf([SelectorToken, DeclarationTokens]).map(
  (x): AstRuleNode => ({
    type: 'RULE',
    selector: x[0],
    declarations: x[1],
  }),
);
