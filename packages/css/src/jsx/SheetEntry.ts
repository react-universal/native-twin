import type { AnyStyle } from '../react-native';
import { RuntimeSheetDeclaration } from './SheetEntryDeclaration';

export const mergeCompiledDeclarations = (entries: RuntimeSheetDeclaration[]) =>
  entries.reduce((prev, current) => {
    if (RuntimeSheetDeclaration.$is('NOT_COMPILED')(current)) {
      return prev;
    }
    let value: any = current.value;
    if (Array.isArray(current.value)) {
      value = [];
      for (const t of current.value) {
        if (typeof t.value === 'string' || typeof t.value === 'number') {
          if (t.value) {
            value.push({
              [t.prop]: t.value,
            });
          }
        }
      }
      Object.assign(prev, {
        transform: [...(prev['transform'] ?? []), ...value],
      });
      return prev;
    }
    if (typeof value === 'object') {
      Object.assign(prev, value);
    } else {
      Object.assign(prev, {
        [current.prop]: value,
      });
    }

    return prev;
  }, {} as AnyStyle);
