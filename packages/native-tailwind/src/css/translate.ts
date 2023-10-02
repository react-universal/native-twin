import type { AnyStyle, CompleteStyle } from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css';
import { resolve } from '../runtime/registry';
import type { RuleResult, ThemeContext } from '../types/config.types';
import type { SheetEntry } from '../types/css.types';
import type { __Theme__ } from '../types/theme.types';
import { entryAtRuleWrapper, escape, sheetEntryDeclarationsToCss } from '../utils/css-utils';
import { toClassName } from '../utils/string-utils';

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

export function sheetEntriesToCss(
  entries: SheetEntry[],
  screens: __Theme__['screens'] = {},
): string {
  if (!entries) {
    return '';
  }
  return entries
    .map((x) => {
      let className = toClassName(x.rule);
      const variants = x.rule.v
        .filter((v) => !(v in screens))
        .map((v) => `:${v}`)
        .join('');
      const valueEntries = sheetEntryDeclarationsToCss(x.declarations);
      return entryAtRuleWrapper(
        x,
        `.${escape(className)}${variants}{${valueEntries}}`,
        screens,
      );
    })
    .join('\n');
}

export function translateParsedRule(rule: ParsedRule, context: ThemeContext): SheetEntry[] {
  const result = resolve(rule, context);
  if (!result) {
    // propagate className as is
    return [{ className: toClassName(rule), declarations: [], group: 'base', rule }];
  }
  return [];
}
