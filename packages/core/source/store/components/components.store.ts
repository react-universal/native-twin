import { lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import type { ITailwindStore } from '../store.types';
import { parseClassNames, parsePseudoElements } from './components.api';
import type { IComponentsStore } from './types';

export const componentsStoreSlice = lens<IComponentsStore, ITailwindStore>(
  (set, get, api) => ({
    registerComponent: (component) => {
      const cachedComponent = get().registeredComponents.get(component.id);
      if (cachedComponent && cachedComponent.className === component.className) {
        return;
      }
      set(
        produce((state: IComponentsStore) => {
          const classes = parseClassNames(component.className);
          let styles = {};
          for (const node of classes.normalClassNames) {
            const compiled = api.getState().styles.compileClassName(node);
            Object.assign(styles, compiled);
          }

          // const currentStyles = classNamesCompiler(classes.normalClassNames);
          const interactions = parsePseudoElements(classes.interactionClassNames);
          // interactions.active.styles = classNamesCompiler(interactions.active.classNames);
          // interactions.focus.styles = classNamesCompiler(interactions.focus.classNames);
          // interactions.hover.styles = classNamesCompiler(interactions.hover.classNames);
          state.registeredComponents.set(component.id, {
            id: component.id,
            className: component.className,
            styles,
            interactionStyles: interactions,
          });
        }),
      );
    },
    registeredComponents: new Map(),
    setComponentInteractions: (id, data) => {
      set(
        produce((state: IComponentsStore) => {
          const exists = state.registeredComponents.get(id);
          if (exists && data.kind in exists.interactionStyles) {
            exists.interactionStyles[data.kind].active = data.active;
          }
        }),
      );
    },
    unregisterComponent: (id) => {
      set(
        produce((state: IComponentsStore) => {
          state.registeredComponents.delete(id);
        }),
      );
    },
  }),
);
