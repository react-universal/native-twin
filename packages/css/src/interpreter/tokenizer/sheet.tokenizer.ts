import type { CssDeclarationValueNode, SelectorGroup } from '../../types';
import * as parser from '../lib';
import { getSelectorGroup } from '../utils';
import { parseRule } from './rule.tokenizer';
import { parseSelector } from './selector.tokenizer';

export interface ParsedRuleNode {
  type: 'rule';
  selector: string;
  group: SelectorGroup;
  declarations: [string, CssDeclarationValueNode][];
}

export const parseCssToRuleNodes = parser.sequence(parseSelector, parseRule).map(
  (x): ParsedRuleNode => ({
    type: 'rule',
    selector: x[0],
    group: getSelectorGroup(x[0]),
    declarations: x[1],
  }),
);
