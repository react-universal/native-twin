import { ComponentSheet } from '../../sheet/StyleSheet';
import { Atom, TwinStore, atom } from '@native-twin/helpers';

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
  return componentsCache.get(id)!;
}
