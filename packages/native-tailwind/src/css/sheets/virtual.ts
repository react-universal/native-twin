import type { Sheet, SheetEntry } from '../../types/css.types';
import { noop } from '../../utils/helpers';

export function createVirtualSheet(): Sheet<SheetEntry[]> {
  const target: SheetEntry[] = [];

  return {
    target,

    clear() {
      target.length = 0;
    },

    destroy() {
      this.clear();
    },

    insert(entry) {
      // console.log('VIRTUAL_ENTRY: ', entry);
      target.push(entry);
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
