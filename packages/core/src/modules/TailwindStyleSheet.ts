import { createStore } from '../store/generator';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';
import { createHash } from '../utils/createHash';
import { transformClassNames } from '../utils/styles.utils';

type IStyleCache = {
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
};
const initialState = {
  stylesCollection: new Map<string, IStyleType>(),
  classNamesCollection: new Map<number, IStyleCache>(),
};

const stylesStore = createStore(initialState);

class TailwindStyleSheet {
  getStylesForClassNames(classNames: string) {
    const classNamesHash = createHash(classNames);
    const cache = this.getClassNameCollectionRegister(classNamesHash);
    console.log('CACHE: ', cache);
    if (cache) return cache;
    const { interactionClassNames, normalClassNames } = parseClassNames(classNames);
    const normalStyles: IStyleType = this.getStylesForClasses(normalClassNames);
    const interactionStyles = this.getStylesForInteractionClasses(interactionClassNames);
    return {
      normalStyles,
      interactionStyles,
    };
  }

  getStylesForClasses(className: string[]) {
    const styles = {};
    console.group('getStylesForClasses');
    console.log('STORE_CACHE', {
      className,
      stylesCollection: [...stylesStore.getState().stylesCollection.entries()],
      classNamesCollection: [...stylesStore.getState().classNamesCollection.entries()],
    });
    for (const current of className) {
      const cache = stylesStore.getState().stylesCollection.get(current);
      console.log('CACHE_FOR: ', current, cache);
      if (cache) {
        Object.assign(styles, cache);
        continue;
      }
      const style = transformClassNames(current);
      stylesStore.getState().stylesCollection.set(current, style);
      Object.assign(style);
    }
    console.groupEnd();
    return styles;
  }

  getStylesForInteractionClasses(classNames: string[][]) {
    let interactionStyles: IComponentInteractions[] = [];
    const interactionsClasses = parsePseudoElements(classNames);
    for (const node of interactionsClasses) {
      const interactionType = node[0];
      const interactionClassNames = node[1];
      const compiled = this.getStylesForClasses([interactionClassNames]);
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

  getClassNameCollectionRegister(classNamesHash: number) {
    return stylesStore.getState().classNamesCollection.get(classNamesHash);
  }

  prepareComponentStore(classNames: string | undefined) {
    const hash = createHash(classNames ?? 'Empty');
    const snapshot = this.getStylesForClassNames(classNames ?? '');
    this.registerComponentClassNames(hash, snapshot);
    return hash;
  }

  private registerComponentClassNames(classNamesHash: number, styles: IStyleCache) {
    const classNamesCache = stylesStore
      .getState()
      .classNamesCollection.set(classNamesHash, styles)
      .get(classNamesHash);
    stylesStore.emitChanges();
    return classNamesCache;
  }
}

export { TailwindStyleSheet, stylesStore };
