import type { TValidInteractionPseudoSelectors } from '../constants';
import { createHash } from '../utils/createHash';

type SubscriptionsCallBack<T> = (currentState: T) => void;

interface IRegisterComponentStore {
  [k: string]: {
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

  const createEmptyComponent = function () {
    return {
      interactionsState: {
        'group-hover': false,
        active: false,
        focus: false,
        hover: false,
      },
    };
  };

  return new Proxy(
    {
      ...initialState,
      subscribe,
    },
    {
      get(target: StoreShape, key: string) {
        if (!Reflect.has(target, key)) {
          // console.log('DOES_NOT_HAVE_THIS_KEY');
          Reflect.set(target, key, createEmptyComponent());
        }
        return Reflect.get(target, key);
      },
      set(target, key, value) {
        const prevValue = Reflect.get(target, key);
        const shallowEqual =
          createHash(JSON.stringify(prevValue)) === createHash(JSON.stringify(value));
        // console.log('MUTATE: ', value);
        if (shallowEqual) {
          // console.log('This update will be prevented: ', key, shallowEqual);
          return false;
        }
        Reflect.set(target, key, value);
        listeners.forEach((l) => l(target));
        return true;
      },
    },
  ) as StoreShape & {
    subscribe: typeof subscribe;
  };
}

export const componentsStore = createInternalStore<IRegisterComponentStore>({});

export function setInteractionState(
  id: string,
  interaction: TValidInteractionPseudoSelectors,
  value: boolean,
) {
  componentsStore[id] = {
    ...componentsStore[id]!,
    interactionsState: {
      ...componentsStore[id]!.interactionsState,
      [interaction]: value,
    },
  };
  return true;
}

export { createInternalStore };
