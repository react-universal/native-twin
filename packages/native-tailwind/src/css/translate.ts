import {
  toCamelCase,
  type AnyStyle,
  type CompleteStyle,
  escapeSelector,
} from '@universal-labs/css';
import { resolveRule } from '../runtime/registry';
import type { RuleResult, ThemeContext } from '../types/config.types';
import type { SheetEntry } from '../types/css.types';
import type { ParsedRule } from '../types/tailwind.types';
import type { __Theme__ } from '../types/theme.types';
import { entryAtRuleWrapper, sheetEntryDeclarationsToCss } from '../utils/css-utils';
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
      const newKey = toCamelCase(key);
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
        `.${escapeSelector(className)}${variants}{${valueEntries}}`,
        screens,
      );
    })
    .join('\n');
}

export function translateRuleSet(rules: ParsedRule[], context: ThemeContext) {
  const result: SheetEntry[] = [];
  for (const rule of rules) {
    if (rule.n == 'group') {
      result.push({
        className: 'group',
        declarations: [],
        group: 'base',
        rule,
      });
      continue;
    }
    for (const entry of translateParsedRule(rule, context)) {
      result.push(entry);
    }
  }
  return result;
}

export function translateParsedRule(rule: ParsedRule, context: ThemeContext): SheetEntry[] {
  const result = resolveRule(rule, context);
  if (!result) {
    // propagate className as is
    return [{ className: toClassName(rule), declarations: [], group: 'base', rule }];
  }
  if (Array.isArray(result)) {
    return result;
  }
  return [result];
}
