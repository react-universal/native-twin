import { useCallback, useSyncExternalStore } from 'react';
import { stylesStore as tailwindStore, ITailwindStore } from '../store';

function useStore<T>(selector: (state: ITailwindStore) => T) {
  return useSyncExternalStore(
    tailwindStore.subscribe,
    useCallback(() => selector(tailwindStore.getState()), [selector]),
  );
}

export { useStore };
