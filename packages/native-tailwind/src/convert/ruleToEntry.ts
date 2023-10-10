import { Layer, moveToLayer } from '@universal-labs/css';
import { resolveRule } from '../store/registry';
import type { ThemeContext } from '../types/config.types';
import type { SheetEntry } from '../types/css.types';
import type { ParsedRule } from '../types/tailwind.types';
import { convert } from '../utils/theme-utils';
import { parsedRuleToClassName } from './ruleToClassName';

export function parsedRuleToEntry(rule: ParsedRule, context: ThemeContext): SheetEntry {
  if (rule.n == 'group') {
    return {
      className: 'group',
      declarations: [],
      group: 'base',
      conditions: [],
      precedence: Layer.u,
      important: rule.i,
    };
  }
  const result = resolveRule(rule, context);
  if (!result) {
    // propagate className as is
    return {
      className: parsedRuleToClassName(rule),
      declarations: [],
      group: 'base',
      conditions: [],
      precedence: Layer.u,
      important: rule.i,
    };
  }
  const newRule = convert(rule, context, Layer.u);
  result.conditions = newRule.v;
  result.precedence = moveToLayer(Layer.u, newRule.p);
  return result;
}
