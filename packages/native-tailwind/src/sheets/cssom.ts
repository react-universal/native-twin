import { sheetEntriesToCss } from '../convert/entryToCss';
import type { Sheet } from '../types/css.types';
import { noop } from '../utils/helpers';
import { warn } from '../utils/warn';
import { getStyleElement } from './getSheet';

export function createCssomSheet(element?: CSSStyleSheet): Sheet<CSSStyleSheet> {
  const target = (element as CSSStyleSheet)?.cssRules
    ? (element as CSSStyleSheet)
    : (getStyleElement(element as any).sheet as CSSStyleSheet);
  console.log('CSSOM_TARGET: ', target);
  return {
    target,

    snapshot() {
      // collect current rules
      const rules = Array.from(target.cssRules, (rule) => rule.cssText);

      return () => {
        // remove all existing rules
        this.clear();

        // add all snapshot rules back
        rules.forEach(this.insert as any);
      };
    },

    clear() {
      // remove all added rules
      for (let index = target.cssRules.length; index--; ) {
        target.deleteRule(index);
      }
    },

    destroy() {
      target.ownerNode?.remove();
    },

    insert(entry, index) {
      const className = entry.className;
      const cssText = typeof entry == 'string' ? entry : sheetEntriesToCss([entry]);
      try {
        // Insert
        target.insertRule(cssText, index);
      } catch (error) {
        // Empty rule to keep index valid — not using `*{}` as that would show up in all rules (DX)
        target.insertRule(':root{}', index);

        // Some thrown errors are because of specific pseudo classes
        // lets filter them to prevent unnecessary warnings
        // ::-moz-focus-inner
        // :-moz-focus-ring
        if (!/:-[mwo]/.test(className)) {
          warn((error as Error).message, 'TW_INVALID_CSS', className);
        }
      }
    },

    insertPreflight(data) {
      return [];
    },

    resume: noop,
  };
}
