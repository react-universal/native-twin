// import { JSXStyledProps } from '../jsx/jsx-custom-props';
import { ComponentSheet } from '../../sheet/StyleSheet';
import { atom } from '../../store/atomic.store';
import { Atom, TwinStore } from '../../store/store.types';

const componentsCache = new Map<string, Atom<TwinStore>>();

export function getTwinComponent(
  id: string,
  styledProps: [string, ComponentSheet][] = [],
): Atom<TwinStore> {
  const component = componentsCache.get(id);
  if (component) {
    return component;
  }
  const meta = {
    hasGroupEvents: styledProps.some((x) => x[1].metadata.hasGroupEvents),
    hasPointerEvents: styledProps.some((x) => x[1].metadata.hasPointerEvents),
    isGroupParent: styledProps.some((x) => x[1].metadata.isGroupParent),
  };
  const values = {
    interactions: {
      isGroupActive: false,
      isLocalActive: false,
    },
    meta,
  };
  const value = atom(values);
  componentsCache.set(id, value);
  // weakCache.set(value, value);
  return componentsCache.get(id)!;
}
