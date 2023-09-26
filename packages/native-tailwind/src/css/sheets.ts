import type { Sheet, SheetEntry } from '../types/css.types';

export function createVirtualSheet(): Sheet<SheetEntry> {
  const target: Map<string, SheetEntry> = new Map();

  return {
    target,

    clear() {
      target.clear();
    },

    destroy() {
      this.clear();
    },

    insert(entry) {
      target.set(entry[0], entry);
    },

    getClassName(key) {
      return target.get(key);
    },
  };
}
