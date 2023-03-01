import { useSyncExternalStore } from 'use-sync-external-store/shim';

function createStore<StoreShape>(initialState: StoreShape) {
  let currentState = initialState;
  const listeners = new Set<(state: StoreShape) => void>();
  const subscribe = (listener: (state: StoreShape) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return {
    setState: (fn: (state: StoreShape) => StoreShape) => {
      currentState = fn(currentState);
      listeners.forEach((listener) => listener(currentState));
    },
    getState: () => {
      return Object.freeze(currentState);
    },
    emitChanges: () => {
      listeners.forEach((listener) => listener(currentState));
    },
    subscribe,
    useStore: <SelectorOutput>(
      selector: (state: StoreShape) => SelectorOutput,
    ): SelectorOutput => {
      return useSyncExternalStore(
        subscribe,
        () => selector(currentState),
        () => selector(currentState),
      );
    },
  };
}

export { createStore };
