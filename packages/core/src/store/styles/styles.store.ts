import { lens } from '@dhmk/zustand-lens';
import produce from 'immer';
import type { ITailwindStore } from '../store.types';
import { transformClassNames } from './styles.api';
import type { IStylesStore } from './types';

export const stylesStoreSlice = lens<IStylesStore, ITailwindStore>((set, get) => ({
  cache: [],
  setCache: (className, styles) => {
    const cachedValue = get().cache.find(([name]) => name === className);
    if (cachedValue) return;
    set(
      produce((draft: IStylesStore) => {
        draft.cache.push([className, styles]);
      }),
    );
  },
  compileClassName: (className) => {
    const cacheValue = get().cache.find(([name]) => name === className);
    if (cacheValue) {
      return cacheValue[1];
    }
    const processedClassName = transformClassNames(className);
    get().setCache(className, processedClassName);
    return processedClassName;
  },
}));
