import { lens } from '@dhmk/zustand-lens';
import type { ITailwindStore } from '../store.types';
import type { IStylesStore } from './types';

export const stylesStoreSlice = lens<IStylesStore, ITailwindStore>(() => ({
  cache: new Map(),
  setCache: () => {},
}));
