import { tw } from '../../runtime/tw';
import type { Sheet } from '../../types/css.types';
import { noop } from '../../utils/helpers';
import { sheetEntriesToCss } from '../translate';
import { getStyleElement } from './utils';

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

    insert(entry) {
      const node = sheetEntriesToCss([entry], tw?.config?.theme['screens'] ?? {});
      console.log('INSERT: ', {
        node,
        entry,
      });
      target.insertBefore(document.createTextNode(node), null);
    },

    resume: noop,
  };
}
