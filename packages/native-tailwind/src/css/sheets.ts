import type { AnyStyle } from '@universal-labs/css';
import type { Sheet } from '../types/css.types';

export function createVirtualSheet(): Sheet<AnyStyle> {
  const target: Map<string, AnyStyle> = new Map();

  return {
    target,

    clear() {
      target.clear();
    },

    destroy() {
      this.clear();
    },

    insert(key, parsedRule, styles) {
      target.set(key, styles);
    },

    getClassName(key) {
      return target.get(key);
    },
  };
}
