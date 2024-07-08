export interface TwinStore {
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

export interface Atom<T> {
  get(): T;
  set(newState: T): void;
  subscribe: (callback: (newState: T) => void) => () => void;
}
export type AtomGetter<AtomValue> = (get: <T>(a: Atom<T>) => T) => AtomValue;
