import { useSyncExternalStore } from 'react';
import { contextStore } from '../internals/store/context.store';

export const useStyledContext = () => {
  return useSyncExternalStore(contextStore.subscribe, () => contextStore.getState());
};
