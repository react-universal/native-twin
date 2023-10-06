import { sheetEntriesToCss } from '../convert/entryToCss';
import type { Sheet } from '../types/css.types';
import { noop } from '../utils/helpers';
import { getStyleElement } from './getSheet';

export function createDomSheet(
  element?: HTMLStyleElement | string | null | false,
): Sheet<HTMLStyleElement> {
  const target = element && typeof element != 'string' ? element : getStyleElement(element);

  return {
    target,

    snapshot() {
      // collect current rules
      const rules = Array.from(target.childNodes, (node) => node.textContent as string);

      return () => {
        // remove all existing rules
        this.clear();

        // add all snapshot rules back
        rules.forEach(this.insert as any);
      };
    },

    clear() {
      target.textContent = '';
    },

    destroy() {
      target.remove();
    },

    insert(entry, index) {
      const node = typeof entry == 'string' ? entry : sheetEntriesToCss([entry]);
      for (const n of target.childNodes) {
        if (n.textContent?.includes(node)) {
          return;
        }
      }
      // console.log('DOM_ENTRY: ', entry);
      target.insertBefore(document.createTextNode(node), target.childNodes[index] || null);
    },

    resume: noop,
  };
}
