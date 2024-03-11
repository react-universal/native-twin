import type { TWParsedRule } from '@universal-labs/css';

export function parsedRuleToClassName(rule: TWParsedRule): string {
  let modifier = '';
  if (rule.m) {
    modifier = `/${rule.m.value}`;
  }
  return `${[...rule.v, (rule.i ? '!' : '') + rule.n + modifier].join(':')}`;
}

export function parsedRuleSetToClassNames(rules: TWParsedRule[]): string {
  return rules.map(parsedRuleToClassName).join(' ');
}
