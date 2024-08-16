import { useEffect, useState, useSyncExternalStore } from 'react';

const createStore = <StoreShape>(initialState: StoreShape) => {
  type StoreSubFn = (newState: StoreShape) => void;

  let currentStore = initialState;
  const subscriptions = new Set<(newState: StoreShape) => void>();

  return {
    get: () => currentStore,
    set: (fn: (newState: StoreShape) => StoreShape) => {
      currentStore = fn(currentStore);
      subscriptions.forEach((x) => x(currentStore));
    },
    subscribe: (fn: StoreSubFn) => {
      subscriptions.add(fn);
      return () => {
        subscriptions.delete(fn);
      };
    },
  };
};

export const globalStore = createStore({ a: 1 }); // ?

globalStore.subscribe((state) => {
  state;
});
globalStore.get(); // ?
globalStore.set((p) => ({ a: 2 }));
globalStore.get(); // ?
globalStore.set((p) => ({ a: 3 }));

export const useStore = () => {
  const [state, setState] = useState(() => globalStore.get());

  useEffect(() => {
    const sub = globalStore.subscribe((newState) => {
      setState(newState);
    });
    return () => {
      sub();
    };
  }, []);
  return state;
};

export const useFuckStore = () => {
  const state = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.get(),
    () => globalStore.get(),
  );

  return state;
};
