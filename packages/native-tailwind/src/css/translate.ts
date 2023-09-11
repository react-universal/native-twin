import type { RuleResult, ThemeContext } from '../types/config.types';
import type { CSSObject } from '../types/css.types';

export function translateRuleResults(rule: RuleResult, _ctx: ThemeContext): CSSObject[] {
  const stylesOrCss: CSSObject[] = [];
  if (!rule) return stylesOrCss;
  if (typeof rule == 'object') {
    const newRule: any = {};
    for (let key of Object.keys(rule)) {
      const newKey = key.replace(/-([a-z])/g, (k) => k[1]!.toUpperCase()!);
      newRule[newKey] = rule[key];
    }
    stylesOrCss.push(newRule);
  }
  return stylesOrCss;
}
