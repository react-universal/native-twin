import { Appearance } from 'react-native';
import { lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import type { ITailwindStore } from '../store.types';
import { parseClassNames, parsePseudoElements } from './components.api';
import type { IComponentInteractions, IComponentsStore } from './types';

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
          let interactionStyles: IComponentInteractions = new Map(
            state.registeredComponents.get(component.id)?.interactionStyles,
          );
          for (const node of classes.normalClassNames) {
            const compiled = api.getState().styles.compileClassName(node);
            Object.assign(styles, compiled);
          }
          const interactionsClasses = parsePseudoElements(classes.interactionClassNames);
          for (const node of interactionsClasses) {
            const interactionType = node[0];
            const interactionClassNames = node[1];
            const compiled = api.getState().styles.compileClassName(interactionClassNames);
            interactionStyles.set(interactionType, {
              classNames: interactionClassNames,
              styles: compiled,
            });
          }

          // const currentStyles = classNamesCompiler(classes.normalClassNames);
          // interactions.active.styles = classNamesCompiler(interactions.active.classNames);
          // interactions.focus.styles = classNamesCompiler(interactions.focus.classNames);
          // interactions.hover.styles = classNamesCompiler(interactions.hover.classNames);
          state.registeredComponents.set(component.id, {
            id: component.id,
            className: component.className,
            styles,
            interactionStyles,
            componentState: {
              active: false,
              focus: false,
              hover: false,
              dark: Appearance.getColorScheme() === 'dark',
            },
          });
        }),
      );
    },
    registeredComponents: new Map(),
    setComponentInteractions: (id, data) => {
      set(
        produce((state: IComponentsStore) => {
          const exists = state.registeredComponents.get(id);
          if (exists && exists.interactionStyles.has(data.kind)) {
            exists.componentState[data.kind] = data.active;
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
