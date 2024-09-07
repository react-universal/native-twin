import { useSyncExternalStore } from 'react';

export interface Atom<T> {
  get(): T;
  set(newState: T): void;
  subscribe: (callback: (newState: T) => void) => () => void;
}
export type AtomGetter<AtomValue> = (get: <T>(a: Atom<T>) => T) => AtomValue;

export const atom = <T>(initialValue: T | AtomGetter<T>): Atom<T> => {
  let currentValue = typeof initialValue === 'function' ? (null as T) : initialValue;

  const subscribers = new Set<(x: T) => void>();
  const subscribed = new Set<Atom<any>>();

  function get<Target>(atom: Atom<Target>): Target {
    let atomValue = atom.get();
    if (!subscribed.has(atom)) {
      subscribed.add(atom);
      atom.subscribe((newValue) => {
        if (newValue === atomValue) return;
        atomValue = newValue;
        computeValue();
      });
    }
    return atomValue;
  }

  function computeValue() {
    const newValue =
      typeof initialValue === 'function'
        ? (initialValue as AtomGetter<T>)(get)
        : currentValue;
    currentValue = null as T;
    currentValue = newValue;
    subscribers.forEach((x) => x(currentValue));
  }

  computeValue();
  return {
    get: () => currentValue,
    set: (newValue) => {
      currentValue = newValue;
      computeValue();
    },
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
  };
};

export const atomStateMap = new WeakMap<Atom<any>, Atom<any>>();

export const useAtom = <T>(atom: Atom<T>): [T, Atom<T>['set']] => {
  return [useSyncExternalStore(atom.subscribe, atom.get, atom.get), atom.set];
};
export const useAtomValue = <T>(atom: Atom<T>) =>
  useSyncExternalStore(atom.subscribe, atom.get, atom.get);
