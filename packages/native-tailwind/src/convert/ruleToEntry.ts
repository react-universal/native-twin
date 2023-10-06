import { Layer, moveToLayer } from '@universal-labs/css';
import { resolveRule } from '../store/registry';
import type { ThemeContext } from '../types/config.types';
import type { SheetEntry } from '../types/css.types';
import type { ParsedRule } from '../types/tailwind.types';
import { mql } from '../utils/css-utils';
import { asArray } from '../utils/helpers';
import { sortedInsertionIndex } from '../utils/sorted-insertion-index';
import { toClassName } from '../utils/string-utils';
import { convert } from '../utils/theme-utils';

export function translateRuleSet(
  rules: ParsedRule[],
  context: ThemeContext,
  precedence = Layer.u,
) {
  const result: SheetEntry[] = [];
  for (const rule of rules) {
    if (rule.n == 'group') {
      result.push({
        className: 'group',
        declarations: [],
        group: 'base',
        rule,
        conditions: [],
      });
      continue;
    }
    for (const entry of translateParsedRule(rule, context)) {
      const newRule = convert(entry.rule, context, precedence);
      result.splice(
        sortedInsertionIndex(
          result.map((x) => x.rule),
          entry.rule,
        ),
        0,
        {
          ...entry,
          rule: {
            ...entry.rule,
            p: moveToLayer(precedence, newRule.p ?? precedence),
          },
        },
      );
    }
  }
  return result;
}

export function translateParsedRule(rule: ParsedRule, context: ThemeContext): SheetEntry[] {
  const result = resolveRule(rule, context);
  if (!result) {
    // propagate className as is
    return [
      { className: toClassName(rule), declarations: [], group: 'base', rule, conditions: [] },
    ];
  }
  const entries: SheetEntry[] = [];
  const medias: string[] = [];
  const variants: string[] = [];
  for (const entry of asArray(result)) {
    if (entry.rule.v.length == 0) {
      entries.push({ ...entry, conditions: [] });
      continue;
    }
    for (const v of entry.rule.v) {
      const screen = context.theme('screens', v);
      if (screen) {
        const media = mql(screen);
        if (media == '') continue;
        medias.push(media);
        continue;
      }
      const variant = context.v(v);
      if (variant) {
        variants.push(...asArray(variant));
      }
    }
    entry.conditions = medias;
    entries.push(entry);
  }
  return entries;
}
