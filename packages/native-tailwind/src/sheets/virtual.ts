import type { Sheet, SheetEntry } from '../types/css.types';
import { noop } from '../utils/helpers';

export function createVirtualSheet(): Sheet<SheetEntry[]> {
  // const utilities = new Set<string>();
  // const mediaRules = new Set<string>();
  const target: SheetEntry[] = [];

  return {
    target,

    clear() {
      target.length = 0;
    },

    destroy() {
      this.clear();
    },

    insert(entry, index) {
      target.splice(index, 0, entry);
    },

    snapshot() {
      // collect current rules
      const rules = [...target];

      return () => {
        target.splice(0, target.length, ...rules);
      };
    },
    resume: noop,
  };
}
