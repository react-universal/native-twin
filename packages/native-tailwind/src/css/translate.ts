import type { RuleResult, ThemeContext } from '../types/config.types';
import type { CSSProperties } from '../types/css.types';
import type { CompleteStyle } from '../types/rn.types';

export function translateRuleResults(rule: RuleResult, _ctx: ThemeContext): CSSProperties[] {
  const stylesOrCss: CSSProperties[] = [];
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
