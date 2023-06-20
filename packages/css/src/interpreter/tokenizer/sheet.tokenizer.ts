import type { CssRuleNode } from '../../types';
import * as parser from '../lib';
import { getSelectorGroup } from '../utils';
import { parseRule } from './rule.tokenizer';
import { parseSelector } from './selector.tokenizer';

export const parseCssToRuleNodes = parser
  .many1(parser.sequence(parseSelector, parseRule))
  .map((x): CssRuleNode[] =>
    x.flatMap((value) => ({
      type: 'rule',
      selector: value[0],
      group: getSelectorGroup(value[0]),
      declarations: value[1],
    })),
  );
