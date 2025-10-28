import type { TwinRuntimeComponent } from '@native-twin/css/jsx';
import { type Atom, atom } from '@native-twin/helpers/react';

export interface ComponentState {
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

const componentsCache = new Map<string, Atom<ComponentState>>();

export function getTwinComponent(twinCmp: TwinRuntimeComponent): Atom<any> {
  const component = componentsCache.get(twinCmp.id);
  if (component) component;
  const meta = twinCmp.metadata;
  const values = {
    interactions: {
      isGroupActive: false,
      isLocalActive: false,
    },
    meta,
  };
  const value = atom(values);
  componentsCache.set(twinCmp.id, value);
  return componentsCache.get(twinCmp.id)!;
}
