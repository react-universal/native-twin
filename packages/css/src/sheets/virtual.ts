import { GlobalSheet, SheetRule } from '../types/css.types';

export function globalSheet(): GlobalSheet {
  const target = new Map<string, SheetRule>();
  const insertedClasses = new Set<string>();
  return {
    target,
    insertedClasses,
    insert(rule) {
      if (!insertedClasses.has(rule.className)) {
        insertedClasses.add(rule.className);
        target.set(rule.className, rule);
      }
    },
    snapshot() {
      return () => {};
    },
    clear() {
      target.clear();
    },
    stringify() {
      return '';
    },
  };
}
