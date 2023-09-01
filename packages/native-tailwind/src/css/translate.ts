import type { RuleResult, Context } from '../types/config.types';
import type { CSSObject } from '../types/css.types';
import type { BaseTheme } from '../types/theme.types';

export function translateRuleResults<Theme extends BaseTheme = BaseTheme>(
  rule: RuleResult,
  _ctx: Context<Theme>,
): CSSObject[] {
  const stylesOrCss: CSSObject[] = [];
  if (!rule) return stylesOrCss;
  if (typeof rule == 'object') {
    const newRule = {};
    for (let key of Object.keys(rule)) {
      const newKey = key.replace(/-([a-z])/g, (k) => k[1]!.toUpperCase()!);
      newRule[newKey] = rule[key];
    }
    stylesOrCss.push(newRule);
  }
  return stylesOrCss;
}
