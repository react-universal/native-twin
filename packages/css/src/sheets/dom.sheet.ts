import { noop, toHyphenCase } from '@universal-labs/helpers';
import { getStyleElement } from '../html/get-style-element';
import { sheetEntriesToCss } from '../transforms/sheet-to-css';
import { Sheet } from './sheet.types';

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
      const node = typeof entry == 'string' ? entry : sheetEntriesToCss(entry);
      target.insertBefore(document.createTextNode(node), target.childNodes[index] || null);
    },

    insertPreflight(data) {
      const nodes: string[] = [];
      for (const p of Object.entries(data)) {
        const className = p[0];
        const declarations: string[] = [];
        for (const d of Object.entries(p[1])) {
          declarations.push([toHyphenCase(d[0]), d[1]].join(':'));
        }
        const current = `${className}{${declarations.join(';')}}`;
        nodes.push(current);
      }
      target.prepend(...nodes);
      return nodes;
    },

    resume: noop,
  };
}
