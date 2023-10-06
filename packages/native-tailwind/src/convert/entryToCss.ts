import { escapeSelector, toHyphenCase } from '@universal-labs/css';
import type { SheetEntry, SheetEntryDeclaration } from '../types/css.types';
import { asArray } from '../utils/helpers';

export function sheetEntriesToCss(entries: SheetEntry[]): string {
  return asArray(entries)
    .filter(Boolean)
    .map((x) => {
      return getEntryRuleBlock(x);
    })
    .join('\n');
}

export function getEntryRuleBlock(entry: SheetEntry) {
  let className = `.${escapeSelector(entry.className)}`;
  const atRules: string[] = [];
  const declarations = sheetEntryDeclarationsToCss(entry.declarations, entry.important);
  for (const condition of entry.conditions) {
    // Media query
    if (condition.startsWith('@') && condition[1] == 'm') {
      atRules.push(condition);
      continue;
    }
    // Pseudo
    if (condition.startsWith('&')) {
      className += condition.replace('&', '');
    }
  }
  return atRules.reduce((prev, current) => {
    return `${current}{${prev}}`;
  }, `${className}{${declarations}}`);
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
  return declarationToCss(body, important);
}

export function declarationToCss(entries: [string, string][], important = false): string {
  return entries
    .flatMap((x) => `${toHyphenCase(x[0])}:${x[1]}${important ? ' !important' : ''};`)
    .join('');
}
