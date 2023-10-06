import type { Sheet, SheetEntry } from '../types/css.types';
import { asArray } from '../utils/helpers';
import { createCssomSheet } from './cssom';
import { createDomSheet } from './dom';
import { createVirtualSheet } from './virtual';

/**
 * Returns a sheet useable in the current environment.
 *
 * @group Sheets
 * @param useDOMSheet usually something like `process.env.NODE_ENV != 'production'` or `import.meta.env.DEV` (default: browser={@link cssom}, server={@link virtual})
 * @param disableResume to not include or use resume data
 * @returns a sheet to use
 */
export function getSheet(
  useDOMSheet?: boolean,
  disableResume?: boolean,
): Sheet<SheetEntry[] | HTMLStyleElement | CSSStyleSheet> {
  const sheet =
    typeof document == 'undefined'
      ? createVirtualSheet()
      : useDOMSheet
      ? createDomSheet()
      : createCssomSheet();

  if (!disableResume) sheet.resume = resumeSheet;

  return sheet;
}

/**
 * @group Sheets
 * @param target
 * @returns
 */
export function stringify(target: unknown): string {
  // string[] | CSSStyleSheet | HTMLStyleElement
  return (
    // prefer the raw text content of a CSSStyleSheet as it may include the resume data
    ((target as CSSStyleSheet).ownerNode || (target as HTMLStyleElement)).textContent ||
    ((target as CSSStyleSheet).cssRules
      ? Array.from((target as CSSStyleSheet).cssRules, (rule) => rule.cssText)
      : asArray(target)
    ).join('')
  );
}

export function resumeSheet(
  this: Sheet,
  addClassName: (className: string) => void,
  insert: (cssText: string, rule: SheetEntry) => void,
) {
  // hydration from SSR sheet
  const textContent = stringify(this.target);
  const RE = /\/\*!([\da-z]+),([\da-z]+)(?:,(.+?))?\*\//g;

  // only if this is a hydratable sheet
  if (RE.test(textContent)) {
    // RE has global flag — reset index to get the first match as well
    RE.lastIndex = 0;

    // 1. start with a fresh sheet
    this.clear();

    // 2. add all existing class attributes to the token/className cache
    if (typeof document != 'undefined') {
      for (const el of document.querySelectorAll('[class]')) {
        addClassName(el.getAttribute('class') as string);
      }
    }

    // 3. parse SSR styles
    let lastMatch: RegExpExecArray | null | undefined;

    while (
      (function commit(match?: RegExpExecArray | null) {
        if (lastMatch) {
          insert(
            // grep the cssText from the previous match end up to this match start
            textContent.slice(lastMatch.index + lastMatch[0].length, match?.index),
            {
              // p: parseInt(lastMatch[1], 36),
              // o: parseInt(lastMatch[2], 36) / 2,
              className: lastMatch[3]!,
            } as any,
          );
        }

        return (lastMatch = match);
      })(RE.exec(textContent))
    ) {
      /* no-op */
    }
  }
}
