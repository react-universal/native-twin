import type { Sheet, SheetEntry } from '../types/css.types';
import { createCssomSheet } from './cssom';
import { createDomSheet } from './dom';
import { createVirtualSheet } from './virtual';

export function getStyleElement(
  selector: string | null | undefined | false,
): HTMLStyleElement {
  let style = document.querySelector(selector || 'style[data-native-twin=""]');

  if (!style || style.tagName != 'STYLE') {
    style = document.createElement('style');
    document.head.prepend(style);
  }
  (style as HTMLElement).dataset['nativeTwin'] = 'claimed';

  return style as HTMLStyleElement;
}

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
): Sheet<SheetEntry[] | HTMLStyleElement | CSSStyleSheet> {
  const sheet =
    typeof document === 'undefined'
      ? createVirtualSheet()
      : useDOMSheet
      ? createDomSheet()
      : createCssomSheet();

  return sheet;
}
