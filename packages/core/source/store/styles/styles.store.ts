import { lens } from '@dhmk/zustand-lens';
import produce from 'immer';
import { parseClassNames } from '../../utils/parser';
import type { ITailwindStore } from '../store.types';
import type { IStylesStore } from './types';

export const stylesStoreSlice = lens<IStylesStore, ITailwindStore>((set, get) => ({
  cache: new Map(),
  setCache: (className, styles) => {
    set(
      produce((draft: IStylesStore) => {
        if (draft.cache.has(className)) return;
        draft.cache.set(className, styles);
      }),
    );
  },
  compileClassName: (className) => {
    const cacheValue = get().cache.get(className);
    if (cacheValue) {
      console.log('CACHE: ', cacheValue);
      return cacheValue;
    }
    const processedClassName = parseClassNames(className);
    get().setCache(className, processedClassName);
    return processedClassName;
  },
}));
