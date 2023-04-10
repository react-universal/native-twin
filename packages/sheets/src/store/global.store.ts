import type { TValidInteractionPseudoSelectors } from '../constants';
import type { IStyleType } from '../types';

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
      return currentState;
    },
    emitChanges: () => {
      listeners.forEach((listener) => listener(currentState));
    },
    subscribe,
  };
}

type TStylesRegistry = Map<string, IStyleType>;

export interface IRegisterComponentStore {
  parentID?: string;
  groupID?: string;
  meta: {
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  };
  interactionsState: Record<TValidInteractionPseudoSelectors, boolean>;
}
type TComponentsRegistry = Map<string, IRegisterComponentStore>;

const globalStore = createStore({
  componentsRegistry: new Map() as TComponentsRegistry,
  stylesRegistry: new Map() as TStylesRegistry,
  componentStylesRegistry: new Map<number, IStyleType>(),
  processedClasses: new Set<string>(),
});

export { globalStore };
