import type { Sheet } from '../types/css.types';
import type { FinalRule } from './rules';

export function createVirtualSheet(): Sheet<FinalRule> {
  const target: Map<string, FinalRule> = new Map();

  return {
    target,

    clear() {
      target.clear();
    },

    destroy() {
      this.clear();
    },

    insert(key, rule: FinalRule) {
      target.set(key, rule);
    },

    getClassName(key) {
      return target.get(key);
    },
  };
}
