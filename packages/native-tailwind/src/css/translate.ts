import type { AnyStyle, CompleteStyle } from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css/tailwind';
import type { RuleResult, ThemeContext } from '../types/config.types';

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
      // @ts-expect-error
      newRule[newKey] = rule[key as keyof CompleteStyle];
    }
    stylesOrCss.push(newRule);
  }
  return stylesOrCss;
}
