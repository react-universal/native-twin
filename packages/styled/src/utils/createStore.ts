export function createStore<StoreShape>(initialState: StoreShape) {
  let currentState = initialState;

  const listeners = new Set<(state: StoreShape) => void>();
  const subscribe = (listener: (state: StoreShape) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return {
    setState: (fn: (state: StoreShape) => StoreShape, publish = true) => {
      currentState = fn(currentState);
      if (publish) {
        listeners.forEach((listener) => listener(currentState));
      }
    },
    getState: () => {
      return currentState;
    },
    emitChanges: () => {
      listeners.forEach((listener) => listener(currentState));
    },
    subscribe,
  };
}
