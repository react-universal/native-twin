import { createCssomSheet } from './cssom.sheet';
import { createDomSheet } from './dom.sheet';
import { Sheet, SheetEntry } from './sheet.types';
import { createVirtualSheet } from './virtual.sheet';

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
