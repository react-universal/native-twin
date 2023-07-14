import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { contextStore } from '../internals/store/context.store';

export const useStyledContext = () => {
  return useSyncExternalStore(contextStore.subscribe, () => contextStore.getState());
};
