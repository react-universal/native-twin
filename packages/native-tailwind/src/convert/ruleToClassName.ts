import type { ParsedRule } from '../types/tailwind.types';

export function parsedRuleToClassName(rule: ParsedRule): string {
  let modifier = '';
  if (rule.m) {
    modifier = `/${rule.m.value}`;
  }
  return `${[...rule.v, (rule.i ? '!' : '') + rule.n + modifier].join(':')}`;
}

export function parsedRuleSetToClassNames(rules: ParsedRule[]): string {
  return rules.map(parsedRuleToClassName).join(' ');
}
