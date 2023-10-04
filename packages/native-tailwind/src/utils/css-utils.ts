import { toHyphenCase, type SelectorGroup } from '@universal-labs/css';
import type { SheetEntryDeclaration } from '../types/css.types';
import type { ParsedRule } from '../types/tailwind.types';
import type { ScreenValue } from '../types/theme.types';
import type { MaybeArray } from '../types/util.types';
import { asArray } from './helpers';

export function getRuleSelectorGroup(rule: ParsedRule): SelectorGroup {
  if (rule.v.length == 0) return 'base';
  if (
    rule.v.includes('group') ||
    rule.v.includes('group-hover') ||
    rule.v.includes('group-active') ||
    rule.v.includes('group-focus')
  )
    return 'group';
  if (rule.v.includes('odd')) return 'odd';
  if (rule.v.includes('even')) return 'even';
  if (rule.v.includes('first')) return 'first';
  if (rule.v.includes('last')) return 'last';
  if (rule.v.includes('hover') || rule.v.includes('focus') || rule.v.includes('active'))
    return 'pointer';
  return 'base';
}

export function sheetEntryDeclarationsToCss(decls: SheetEntryDeclaration[]) {
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
  return parseRuleBodyEntries(body);
}

export function parseRuleBodyEntries(entries: [string, string][]): string {
  return entries.flatMap((x) => `${toHyphenCase(x[0])}:${x[1]};`).join('');
}

export function entryAtRuleWrapper(mql: string[], cssText: string) {
  const result = asArray(mql).reduce((prev, current) => {
    prev = `${current}{${prev}}`;
    return prev;
  }, cssText);
  return result;
}

/**
 * @internal
 * @param screen
 * @param prefix
 * @returns
 */
export function mql(screen: MaybeArray<ScreenValue>, prefix = '@media '): string {
  // if (!screen) return '';
  return (
    prefix +
    asArray(screen)
      .map((screen) => {
        if (typeof screen == 'string') {
          screen = { min: screen };
        }

        return (
          (screen as { raw?: string }).raw ||
          Object.keys(screen)
            .map(
              (feature) => `(${feature}-width:${(screen as Record<string, string>)[feature]})`,
            )
            .join(' and ')
        );
      })
      .join(',')
  );
}
