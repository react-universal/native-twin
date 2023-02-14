import type {
  IComponentInteractions,
  IComponentsStore,
  IRegisterComponentArgs,
} from '../types/store.types';
import type { IStyleTuple } from '../types/styles.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';
import { transformClassNames } from '../utils/styles.utils';

export const stylesCache: IStyleTuple[] = [];
export const storeListeners = new Set<(state: IComponentsStore) => void>();

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

export const tailwindStore = createStore({ components: [], styles: [] });

function getComponentByID(componentID: string) {
  return tailwindStore.getState().components.find(([id]) => id === componentID);
}

function compileClassName(className: string) {
  const cacheValue = stylesCache.find(([name]) => name === className);
  if (cacheValue) {
    return cacheValue[1];
  }
  const processedClassName = transformClassNames(className);
  stylesCache.push([className, processedClassName]);
  return processedClassName;
}

export function registerComponent(component: IRegisterComponentArgs) {
  const cachedComponent = getComponentByID(component.id);
  if (cachedComponent) {
    const [, componentData] = cachedComponent;
    if (componentData.className === component.className) return;
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
  tailwindStore.setState((prevState) => ({
    ...prevState,
    components: [
      ...prevState.components,
      [
        component.id,
        {
          id: component.id,
          className: component.className,
          styles,
          interactionStyles,
        },
      ],
    ],
  }));
}
