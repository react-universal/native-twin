import type { Sheet } from '../types/css.types';
import { noop } from '../utils/helpers';

export function createVirtualSheet(includeResumeData?: boolean): Sheet<string[]> {
  const target: string[] = [];

  return {
    target,

    snapshot() {
      // collect current rules
      const rules = [...target];

      return () => {
        // remove all existing rules and add all snapshot rules back
        target.splice(0, target.length, ...rules);
      };
    },

    clear() {
      target.length = 0;
    },

    destroy() {
      this.clear();
    },

    insert(css, index) {
      target.splice(index, 0, includeResumeData ? css : css);
    },

    resume: noop,
  };
}
