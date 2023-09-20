import type { AnyStyle } from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css/tailwind';
import type { RuleResult, ThemeContext } from '../types/config.types';
import type { CompleteStyle } from '../types/rn.types';

export function translateRuleResults(
  rule: RuleResult,
  _parsedRule: ParsedRule,
  _ctx: ThemeContext,
): AnyStyle[] {
  const stylesOrCss: AnyStyle[] = [];
  if (!rule) return stylesOrCss;
  if (typeof rule == 'object') {
    const newRule: any = {};
    for (let key of Object.keys(rule)) {
      const newKey = key.replace(/-([a-z])/g, (k) => k[1]!.toUpperCase()!);
      newRule[newKey] = rule[key as keyof CompleteStyle];
    }
    stylesOrCss.push(newRule);
  }
  return stylesOrCss;
}
