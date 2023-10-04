import { escapeSelector, simplePseudoLookup, Layer, moveToLayer } from '@universal-labs/css';
import { resolveRule } from '../runtime/registry';
import type { ThemeContext } from '../types/config.types';
import type { SheetEntry } from '../types/css.types';
import type { ParsedRule } from '../types/tailwind.types';
import { entryAtRuleWrapper, mql, sheetEntryDeclarationsToCss } from '../utils/css-utils';
import { asArray } from '../utils/helpers';
import { toClassName } from '../utils/string-utils';
import { convert } from '../utils/theme-utils';
import { sortedInsertionIndex } from './sorted-insertion-index';

export function sheetEntriesToCss(entries: SheetEntry[]): string {
  if (!entries) {
    return '';
  }
  return entries
    .map((x) => {
      let className = toClassName(x.rule);
      const variants = x.rule.v
        .filter((v) => simplePseudoLookup[`:${v}`] || simplePseudoLookup[v])
        .map((v) => `:${v}`)
        .join('');
      const valueEntries = sheetEntryDeclarationsToCss(x.declarations);
      return entryAtRuleWrapper(
        x.mql,
        `.${escapeSelector(className)}${variants}{${valueEntries}}`,
      );
    })
    .join('\n');
}

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
        mql: [],
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
    return [{ className: toClassName(rule), declarations: [], group: 'base', rule, mql: [] }];
  }
  const entries: SheetEntry[] = [];
  const medias: string[] = [];
  for (const entry of asArray(result)) {
    if (entry.rule.v.length == 0) {
      entries.push({ ...entry, mql: [] });
      continue;
    }
    for (const v of entry.rule.v) {
      const screen = context.theme('screens', v);
      if (!screen) continue;
      const media = mql(screen);
      if (media == '') continue;
      medias.push(media);
    }
    entry.mql = medias;
    entries.push(entry);
  }
  return entries;
}
