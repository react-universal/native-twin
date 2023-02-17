import { useCallback, useSyncExternalStore } from 'react';
import { tailwindStore } from '../store';
import type { IComponentsStore } from '../types/store.types';

function useStore<T>(selector: (state: IComponentsStore) => T) {
  return useSyncExternalStore(
    tailwindStore.subscribe,
    useCallback(() => selector(tailwindStore.getState()), [selector]),
  );
}

export { useStore };
