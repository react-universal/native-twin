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
        conditions: [],
        precedence: Layer.u,
        important: rule.i,
      });
      continue;
    }
    for (const entry of translateParsedRule(rule, context)) {
      const newRule = convert(rule, context, precedence);
      result.splice(
        sortedInsertionIndex(
          result.map((x) => x),
          entry,
        ),
        0,
        {
          ...entry,
          precedence: moveToLayer(precedence, newRule.p ?? precedence),
          conditions: newRule.v,
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
      {
        className: toClassName(rule),
        declarations: [],
        group: 'base',
        conditions: [],
        precedence: Layer.u,
        important: rule.i,
      },
    ];
  }
  const entries: SheetEntry[] = [];
  const medias: string[] = [];
  const variants: string[] = [];
  for (const entry of asArray(result)) {
    if (entry.conditions.length == 0) {
      entries.push({ ...entry, conditions: [] });
      continue;
    }
    for (const v of rule.v) {
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
