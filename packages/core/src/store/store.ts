function createStore<T>(initialState: T) {
  let currentState = initialState;
  const listeners = new Set();
  const subscribe = (listener: any) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return {
    getState: () => currentState,
    setState: (newState: T) => (currentState = newState),
    subscribe,
  };
}

const store = createStore({});

export default store;

export type IStore = ReturnType<typeof store.getState>;
