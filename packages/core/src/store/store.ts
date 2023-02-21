import type { IComponentInteractions } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';
import { createHash } from '../utils/createHash';
import { transformClassNames } from '../utils/styles.utils';

export type IClassNamesStyle = {
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
};
interface IStoreType {
  stylesCollection: [number, IStyleType][];
  classNamesCollection: [number, IClassNamesStyle][];
}
const createStore = (initialState: IStoreType) => {
  let currentState = initialState;
  const getState = () => currentState;
  const storeListeners = new Set<() => void>();
  const emitChanges = () => {
    storeListeners.forEach((l) => l());
  };
  const subscribe = (listener: () => void) => {
    storeListeners.add(listener);
    return () => {
      storeListeners.delete(listener);
    };
  };
  const setState = (fn: (state: IStoreType) => IStoreType) => {
    currentState = fn(currentState);
    storeListeners.forEach((listener) => listener());
  };

  const registerClassNames = (classNames: string) => {
    const classNamesHash = createHash(classNames);
    const cache = currentState.classNamesCollection.find(([hash]) => classNamesHash === hash);
    console.log('CACHE: ', cache);
    if (cache) classNamesHash;
    const { interactionClassNames, normalClassNames } = parseClassNames(classNames);
    console.log('CACHE: ', { interactionClassNames, normalClassNames });
    getStylesForClasses(normalClassNames);
    getStylesForInteractionClasses(interactionClassNames);
    return classNamesHash;
  };

  return { getState, setState, subscribe, emitChanges, registerClassNames };
};

export const tailwindStore = createStore({
  classNamesCollection: [],
  stylesCollection: [],
});

function getStylesForClasses(className: string[]) {
  const styles = {};
  for (const current in className) {
    const classNameHash = createHash(current);
    const cache = tailwindStore
      .getState()
      .stylesCollection.find(([hash]) => classNameHash === hash);
    if (cache) {
      Object.assign(styles, cache);
      continue;
    }
    const style = transformClassNames(current);
    tailwindStore.setState((prevState) => {
      prevState.stylesCollection.push([classNameHash, style]);
      return prevState;
    });
    Object.assign(style);
  }
  return styles;
}

function getStylesForInteractionClasses(classNames: string[][]) {
  let interactionStyles: IComponentInteractions[] = [];
  const interactionsClasses = parsePseudoElements(classNames);
  for (const node of interactionsClasses) {
    const interactionType = node[0];
    const interactionClassNames = node[1];
    const compiled = getStylesForClasses([interactionClassNames]);
    interactionStyles.push([
      interactionType,
      {
        classNames: interactionClassNames,
        styles: compiled,
      },
    ]);
  }
  return interactionStyles;
}
