import { useSyncExternalStore } from 'react';
import produce from 'immer';
import type { IRegisterComponentArgs, IComponent } from '../types/store.types';

// const listeners = new Set<() => void>();
type IStore = Record<string, IComponent>;

const createStore = (initialState: IStore) => {
  let currentState = initialState;
  const getState = () => currentState;
  const storeListeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    storeListeners.add(listener);
    return () => {
      storeListeners.delete(listener);
    };
  };
  const setState = (fn: (state: IStore) => IStore) => {
    currentState = fn(currentState);
    storeListeners.forEach((listener) => listener());
  };

  return { getState, setState, subscribe };
};

const store = createStore({});

function getComponentByID(componentID: string) {
  return store.getState()[componentID];
}

function registerComponent(component: IRegisterComponentArgs) {
  store.setState((prevState) => {
    return produce(prevState, (draft) => {
      if (!draft[component.id]) {
        draft[component.id] = {
          id: component.id,
          interactionStyles: [],
          styles: component.inlineStyles,
          className: component.className,
        };
      }
    });
  });
}

function useComponentStore(component: IRegisterComponentArgs) {
  const payload = useSyncExternalStore(store.subscribe, store.getState);
  console.log('STORE: ', payload);
  payload['asd'].className = '';
  return payload;
}

export { useComponentStore };
