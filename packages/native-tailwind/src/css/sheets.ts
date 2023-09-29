import type { Sheet, SheetEntry } from '../types/css.types';
import { noop } from '../utils/helpers';

export function createVirtualSheet(): Sheet<SheetEntry> {
  let target: Map<string, SheetEntry> = new Map();

  return {
    target,

    clear() {
      target.clear();
    },

    destroy() {
      this.clear();
    },

    insert(entry) {
      target.set(entry.className, entry);
    },

    getClassName(key) {
      return target.get(key);
    },

    snapshot() {
      // collect current rules
      const rules = new Map([...target]);
      // target.clear();

      return () => {
        target.clear();
        target = rules;
      };
    },
    resume: noop,
  };
}
