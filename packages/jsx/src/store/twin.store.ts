import { useCallback, useContext, useId, useSyncExternalStore } from 'react';
import { groupContext } from '../context';
import { JSXStyledProps } from '../jsx/jsx-custom-props';

interface TwinStore {
  meta: {
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
    isGroupParent: boolean;
  };
  interactions: {
    isLocalActive: boolean;
    isGroupActive: boolean;
  };
}

const proxyObj: Record<string, TwinStore> = {};

const globalStore = new Proxy(proxyObj, {
  get(target, key, receiver) {
    if (key in target) {
      return Reflect.get(target, key, receiver);
    }
  },
  set(target, key, newValue) {
    Reflect.set(target, key, newValue);
    return true;
  },
});

export function createTwinStore() {
  const subscribers = new Set<() => void>();

  return {
    currentState: globalStore,
    get,
    registerComponent,
    subscribe,
    onChange,
  };

  function get(id: string) {
    return globalStore[id];
  }

  function subscribe(cb: () => void) {
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }

  function onChange(id: string, value: boolean) {
    const state = Reflect.get(globalStore, id);

    Reflect.set(globalStore, id, {
      ...state,
      interactions: {
        isLocalActive: value,
        isGroupActive: value,
      },
    });
    for (const cb of subscribers) {
      cb();
    }
  }

  function registerComponent(id: string, styledProps: JSXStyledProps[] = []): TwinStore {
    if (id in globalStore) {
      return Reflect.get(globalStore, id);
    }
    const meta = {
      hasGroupEvents: styledProps.some((x) => x[1].metadata.hasGroupEvents),
      hasPointerEvents: styledProps.some((x) => x[1].metadata.hasPointerEvents),
      isGroupParent: styledProps.some((x) => x[1].metadata.isGroupParent),
    };
    const values: TwinStore = {
      interactions: {
        isGroupActive: false,
        isLocalActive: false,
      },
      meta,
    };
    Reflect.set(globalStore, id, values);
    return Reflect.get(globalStore, id);
  }
}

const twinStore = createTwinStore();
const DEFAULT_INTERACTIONS = Object.freeze({
  isGroupActive: false,
  isLocalActive: false,
});

export const useTwinStore = (styledProps: JSXStyledProps[] = []) => {
  const context = useContext(groupContext);
  const id = useId();

  const state = useSyncExternalStore(
    twinStore.subscribe,
    () => twinStore.registerComponent(id, styledProps),
    () => twinStore.registerComponent(id, styledProps),
  );

  const parentState = useSyncExternalStore(twinStore.subscribe, () => {
    if (state.meta.hasGroupEvents) {
      return twinStore.registerComponent(context ?? 'NONCE').interactions;
    }
    return DEFAULT_INTERACTIONS;
  });

  const onChange = useCallback(
    (active: boolean) => {
      twinStore.onChange(id, active);
    },
    [id],
  );

  return {
    state,
    id,
    onChange,
    parentState,
  };
};

// export const useTwinStoreWithSelector = <T>(
//   styledProps: JSXStyledProps[],
//   fn: (x: TwinStore) => T,
// ) => {
//   const id = useId();
//   const storeRef = useRef(createTwinStore(styledProps));
//   const store = storeRef.current;

//   return useSyncExternalStore(
//     store.subscribe,
//     useCallback(() => fn(store.get()), []),
//   );
// };
