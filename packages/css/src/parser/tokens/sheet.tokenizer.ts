import * as parser from '..';
import { getSelectorGroup } from '../../interpreter/utils';
import type { CssDeclarationValueNode, SelectorGroup } from '../../types';
import { parseRule } from './rule.token';
import { parseSelector } from './selector.tokenizer';

export interface ParsedRuleNode {
  type: 'rule';
  selector: string;
  group: SelectorGroup;
  declarations: [string, CssDeclarationValueNode][];
}

export const parseCssToRuleNodes = parser.sequence(parseSelector, parseRule).map((x) => ({
  type: 'rule',
  selector: x[0],
  group: getSelectorGroup(x[0]),
  declarations: x[1],
}));
