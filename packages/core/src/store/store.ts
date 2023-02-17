import produce from 'immer';
import type {
  IComponentInteractions,
  IComponentsStore,
  IRegisterComponentArgs,
  IRegisteredComponent,
} from '../types/store.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';
import { transformClassNames } from '../utils/styles.utils';

const createStore = (initialState: IComponentsStore) => {
  let currentState = initialState;
  const getState = () => currentState;
  const storeListeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    storeListeners.add(listener);
    return () => {
      storeListeners.delete(listener);
    };
  };
  const setState = (fn: (state: IComponentsStore) => IComponentsStore) => {
    currentState = fn(currentState);
    storeListeners.forEach((listener) => listener());
  };

  return { getState, setState, subscribe };
};

export const tailwindStore = createStore({
  components: [],
  styles: [],
  registerComponent,
  unregisterComponent,
});

function getComponentByID(componentID: string) {
  return tailwindStore.getState().components.find(([id]) => id === componentID);
}

function compileClassName(className: string) {
  const cacheValue = tailwindStore.getState().styles.find(([name]) => name === className);
  if (cacheValue) {
    return cacheValue[1];
  }
  const processedClassName = transformClassNames(className);
  tailwindStore.setState((prevState) => {
    return produce(prevState, (draft) => {
      draft.styles.push([className, processedClassName]);
    });
  });
  return processedClassName;
}

function registerComponent(component: IRegisterComponentArgs): IRegisteredComponent {
  const cachedComponent = getComponentByID(component.id);
  if (cachedComponent) {
    const [, componentData] = cachedComponent;
    if (componentData.className === component.className) return cachedComponent;
  }
  const classes = parseClassNames(component.className);
  let styles = {};
  let interactionStyles: IComponentInteractions[] = [];
  for (const node of classes.normalClassNames) {
    const compiled = compileClassName(node);
    Object.assign(styles, compiled);
  }
  const interactionsClasses = parsePseudoElements(classes.interactionClassNames);
  for (const node of interactionsClasses) {
    const interactionType = node[0];
    const interactionClassNames = node[1];
    const compiled = compileClassName(interactionClassNames);
    interactionStyles.push([
      interactionType,
      {
        classNames: interactionClassNames,
        styles: compiled,
      },
    ]);
  }
  tailwindStore.setState((prevState) => {
    return produce(prevState, (draft) => {
      draft.components.push([
        component.id,
        {
          id: component.id,
          className: component.className,
          styles,
          interactionStyles,
        },
      ]);
    });
  });
  return [
    component.id,
    {
      interactionStyles: interactionStyles,
      styles,
      id: component.id,
      className: component.className,
    },
  ];
}

function unregisterComponent(componentID: string) {
  tailwindStore.setState((prevState) => {
    return produce(prevState, (draft) => {
      draft.components.filter(([id]) => componentID === id);
    });
  });
}
