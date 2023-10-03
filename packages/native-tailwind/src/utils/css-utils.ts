import { toHyphenCase, type SelectorGroup } from '@universal-labs/css';
import type { SheetEntry, SheetEntryDeclaration } from '../types/css.types';
import type { ClassNameToken, ParsedRule } from '../types/tailwind.types';
import type { ScreenValue, __Theme__ } from '../types/theme.types';
import type { MaybeArray } from '../types/util.types';
import { asArray } from './helpers';

/**
 * @description CSS Selector Escape
 */
export function escape(string: string) {
  return (
    string
      // Simplified escape testing only for chars that we know happen to be in tailwind directives
      .replace(/[!"'`*+.,;:\\/<=>?@#$%&^|~()[\]{}]/g, '\\$&')
      // If the character is the first character and is in the range [0-9] (2xl, ...)
      // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
      .replace(/^\d/, '\\3$& ')
  );
}

export function parseClassNameTokens(...tokens: ClassNameToken[]): string {
  return tokens.reduce((prev, current, currentIndex) => {
    prev += current.value.n;
    if (currentIndex == tokens.length - 1) return prev;
    return prev;
  }, ``);
}

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

/**
 * Determines if two class name strings contain the same classes.
 *
 * @param a first class names
 * @param b second class names
 * @returns are they different
 */
export function changed(a: string, b: string): boolean {
  return a != b && '' + a.split(' ').sort() != '' + b.split(' ').sort();
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

export function entryAtRuleWrapper(
  entry: SheetEntry,
  cssText: string,
  screens: __Theme__['screens'] = {},
) {
  let result = '';
  if (entry.rule.v.length == 0) {
    return cssText;
  }
  for (const v of entry.rule.v) {
    if (v in screens) {
      result += getMediaRule(screens[v], cssText);
    }
  }
  if (result == '') {
    return cssText;
  }
  return result;
}

function getMediaRule(screen: ScreenValue | undefined, text: string) {
  if (typeof screen == 'string') {
    return `@media (min-width: ${screen}){${text}}`;
  }
  return text;
}

/**
 * @internal
 * @param screen
 * @param prefix
 * @returns
 */
export function mql(screen: MaybeArray<ScreenValue>, prefix = '@media '): string {
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
