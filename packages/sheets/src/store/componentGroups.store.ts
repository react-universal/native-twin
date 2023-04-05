import type { TValidInteractionPseudoSelectors } from '../constants';

type SubscriptionsCallBack<T> = (currentState: T) => void;

export interface IRegisterGroupStore {
  [k: string]: {
    parentID?: string;
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

const componentGroupsStore = createInternalStore<IRegisterGroupStore>({});

const registerGroupInStore = function (
  groupID: string,
  meta: {
    groupID: string;
  },
) {
  if (!Reflect.has(componentGroupsStore, groupID)) {
    Reflect.set(componentGroupsStore, groupID, {
      groupID: meta.groupID,
      interactionsState: {
        'group-hover': false,
        active: false,
        focus: false,
        hover: false,
      },
    });
  }
  return Reflect.get(componentGroupsStore, groupID);
};

export { registerGroupInStore, componentGroupsStore };
