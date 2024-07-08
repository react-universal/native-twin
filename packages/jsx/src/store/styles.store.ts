import type { SheetEntry } from '@native-twin/css';
import { atom, Atom } from './atomic.store';

export const globalStyles = new Map<string, Atom<SheetEntry>>();
export const opaqueStyles = new WeakMap<object, SheetEntry>();

export function upsertGlobalStyle(name: string, ruleSet: SheetEntry) {
  let styleObservable = globalStyles.get(name);

  if (!styleObservable) {
    styleObservable = atom(ruleSet);
    globalStyles.set(name, styleObservable);
    if (process.env['NODE_ENV'] !== 'production') {
      const originalGet = styleObservable.get;
      styleObservable.get = () => {
        const value = originalGet();
        return value;
      };
    }
  }

  styleObservable.set(ruleSet);
}
