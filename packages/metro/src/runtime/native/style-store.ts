import type { SheetEntry } from '@native-twin/css';
import { Observable, observable } from '../observable';

export const globalStyles = new Map<string, Observable<SheetEntry>>();
export const opaqueStyles = new WeakMap<object, SheetEntry>();

export function upsertGlobalStyle(name: string, ruleSet: SheetEntry) {
  let styleObservable = globalStyles.get(name);

  if (!styleObservable) {
    styleObservable = observable(ruleSet, { name });
    globalStyles.set(name, styleObservable);
    if (process.env.NODE_ENV !== 'production') {
      const originalGet = styleObservable.get;
      styleObservable.get = () => {
        const value = originalGet();
        return value;
      };
    }
  }

  styleObservable.set(ruleSet);
}
