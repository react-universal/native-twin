import type { IComponentsStore } from '../types/store.types';

const createStore = (initialState: IComponentsStore) => {
  let currentState = initialState;
  const getState = () => currentState;
  const storeListeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    storeListeners.add(listener);
    return () => {
      storeListeners.delete(listener);
    };
  };
  const setState = (fn: (state: IComponentsStore) => IComponentsStore) => {
    currentState = fn(currentState);
    storeListeners.forEach((listener) => listener());
  };

  return { getState, setState, subscribe };
};

export const tailwindStore = createStore({
  styles: [],
});
