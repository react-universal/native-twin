import { lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import type { ITailwindStore } from '../store.types';
import type { IComponentsStore } from './types';

export const componentsStoreSlice = lens<IComponentsStore, ITailwindStore>(
  (set, get, api) => ({
    registerComponent: (component) => {
      set(
        produce((state: IComponentsStore) => {
          // console.log('EXISTS: ', state.registeredComponents.has(component.id));
          const styles = {};
          const separateClassNames = component.className
            ?.replace(/\s+/g, ' ')
            .trim()
            .split(' ');
          if (component.className) {
            Object.assign(styles, api.getState().tailwind.getStyles.style(separateClassNames));
          }
          state.registeredComponents.set(component.id, {
            id: component.id,
            className: component.className,
            styles,
          });
        }),
      );
      return get().registeredComponents.get(component.id)!;
    },
    registeredComponents: new Map(),
    unregisterComponent: (id) => {
      set(
        produce((state: IComponentsStore) => {
          state.registeredComponents.delete(id);
        }),
      );
    },
  }),
);
