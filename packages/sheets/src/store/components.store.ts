import type { TValidInteractionPseudoSelectors } from '../constants';

type SubscriptionsCallBack<T> = (currentState: T) => void;

interface IRegisterComponentStore {
  [k: string]: {
    parentID?: string;
    groupID: string;
    meta: {
      isFirstChild: boolean;
      isLastChild: boolean;
      nthChild: number;
    };
    interactionsState: Record<TValidInteractionPseudoSelectors, boolean>;
  };
}

function createInternalStore<StoreShape extends object>(initialState: StoreShape) {
  const listeners = new Set<SubscriptionsCallBack<StoreShape>>();
  const subscribe = (listener: (state: StoreShape) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return new Proxy(
    {
      ...initialState,
      subscribe,
    },
    {
      get(target: StoreShape, key: string, receiver) {
        return Reflect.get(target, key, receiver);
      },
      set(target, key, value, receiver) {
        Reflect.set(target, key, value, receiver);
        listeners.forEach((l) => l(target));
        return true;
      },
      getOwnPropertyDescriptor(target, key) {
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
      has(target, key) {
        return Reflect.has(target, key);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target);
      },
    },
  ) as StoreShape & {
    subscribe: typeof subscribe;
  };
}

const componentsStore = createInternalStore<IRegisterComponentStore>({});

const registerComponentInStore = function (
  componentID: string,
  meta: {
    parentID?: string;
    groupID?: string;
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  },
) {
  if (!Reflect.has(componentsStore, componentID)) {
    Reflect.set(componentsStore, componentID, {
      parentID: meta.parentID,
      groupID: meta.groupID,
      meta,
      interactionsState: {
        'group-hover': false,
        active: false,
        focus: false,
        hover: false,
      },
    });
  }
  return Reflect.get(componentsStore, componentID);
};

export { createInternalStore, registerComponentInStore, componentsStore };
