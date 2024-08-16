import { useSyncExternalStore } from 'react';

const createStore = <StoreShape>(initialState: StoreShape) => {
  type StoreSubFn = (newState: StoreShape) => void;

  let currentState = initialState;
  const subscriptions = new Set<(newState: StoreShape) => void>();

  return {
    get: () => currentState,
    set: (fn: (newState: StoreShape) => StoreShape) => {
      currentState = fn(currentState);
      subscriptions.forEach((x) => x(currentState));
    },
    subscribe: (fn: StoreSubFn) => {
      subscriptions.add(fn);
      return () => {
        subscriptions.delete(fn);
      };
    },
    useStore: <SelectorOutput>(
      selector: (state: StoreShape) => SelectorOutput,
    ): SelectorOutput => {
      const state = useSyncExternalStore(
        globalStore.subscribe,
        () => selector(currentState),
        () => selector(currentState),
      );

      return state;
    },
  };
};

export const globalStore = createStore({ a: 1 }); // ?
