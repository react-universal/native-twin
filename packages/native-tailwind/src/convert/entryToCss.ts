import { escapeSelector, simplePseudoLookup, toHyphenCase } from '@universal-labs/css';
import type { SheetEntry, SheetEntryDeclaration } from '../types/css.types';
import { asArray } from '../utils/helpers';
import { toClassName } from '../utils/string-utils';

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
      const valueEntries = sheetEntryDeclarationsToCss(x.declarations, x.rule.i);
      return entryAtRuleWrapper(
        x.conditions,
        `.${escapeSelector(className)}${variants}{${valueEntries}}`,
      );
    })
    .join('\n');
}

export function sheetEntryDeclarationsToCss(
  decls: SheetEntryDeclaration[],
  important = false,
) {
  const body: [string, string][] = [];
  for (const d of decls) {
    if (typeof d[1] == 'object' && !Array.isArray(d[1])) {
      body.push(...Object.entries(d[1]));
    }
    if (Array.isArray(d[1])) {
      body.push(...d[1]);
    }
    if (typeof d[1] == 'string') {
      body.push([d[0], d[1]]);
    }
  }
  return parseRuleBodyEntries(body, important);
}

export function parseRuleBodyEntries(entries: [string, string][], important = false): string {
  return entries
    .flatMap((x) => `${toHyphenCase(x[0])}:${x[1]}${important ? ' !important' : ''};`)
    .join('');
}

export function entryAtRuleWrapper(mql: string[], cssText: string) {
  const result = asArray(mql).reduce((prev, current) => {
    prev = `${current}{${prev}}`;
    return prev;
  }, cssText);
  return result;
}
