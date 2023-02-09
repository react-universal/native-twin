import { useSyncExternalStore } from 'react';
import store, { IStore } from './store';

const useStore = <TSelectorOutput>(selector: (state: IStore) => TSelectorOutput) => {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
};

export { useStore };
