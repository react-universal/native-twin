import { setup } from '@react-universal/native-tailwind';
import {
  GROUP_PARENT_MASK,
  HOVER_INTERACTION_MASK,
  INITIAL_MASK,
  INTERACTIONS_MASK,
} from '../constants';
import type { IComponentInteractions, IClassNamesStyle } from '../types/store.types';
import type { IStyleTuple, IStyleType } from '../types/styles.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';
import { createHash } from '../utils/createHash';
import { cssPropertiesResolver } from './resolve';

class TailwindManager {
  componentsState: Map<number, IClassNamesStyle> = new Map();
  stylesCollection: Map<string, IStyleType> = new Map();
  private listeners = new Set<() => void>();
  private tw = setup({ content: ['__'] });

  private getStringHash(input: string) {
    return createHash(input);
  }
  private getCachedComponent(hash: number) {
    return this.componentsState.get(hash);
  }

  private getJSS(classNames: string[]) {
    // console.groupCollapsed('getJSS');
    const styleTuple = classNames.reduce((previous, current) => {
      const cache = this.stylesCollection.get(current);
      if (cache) {
        // console.log('getJSS_CACHE_HIT: ', current);
        previous.push([current, cache]);
      } else {
        // console.log('getJSS_CACHE_MISS: ', current);
        const styles = this.tw(current);
        const rnStyles = cssPropertiesResolver(styles.JSS);
        previous.push([current, rnStyles]);
        this.stylesCollection.set(current, rnStyles);
      }
      return previous;
    }, [] as IStyleTuple[]);
    // console.table(styleTuple);
    // console.groupEnd();

    return styleTuple;
  }

  private getStylesForInteractionClasses(classNames: string[][]) {
    let interactionStyles: IComponentInteractions[] = [];
    const interactionsClasses = parsePseudoElements(classNames);
    for (const node of interactionsClasses) {
      const interactionType = node[0];
      const interactionClassNames = node[1];
      const compiled = this.getJSS([interactionClassNames]);
      interactionStyles.push([
        interactionType,
        {
          classNames: interactionClassNames,
          styles: compiled.reduce((obj, d) => Object.assign(obj, d[1]), {}),
        },
      ]);
    }
    return interactionStyles;
  }

  // EXPOSED METHODS
  prepare(classNames: string): IClassNamesStyle {
    const hash = this.getStringHash(classNames);
    const cache = this.getCachedComponent(hash);
    // If we already have a hash with this collection of classes
    // Then return it
    if (cache) {
      return cache;
    }

    const parsed = parseClassNames(classNames);
    const normalStyles = this.getJSS(parsed.normalClassNames);
    const interactionStyles = this.getStylesForInteractionClasses(
      parsed.interactionClassNames,
    );
    const isParent = normalStyles.some(([name]) => name === 'group');
    let componentMask = INITIAL_MASK;
    if (isParent) {
      componentMask |= GROUP_PARENT_MASK;
    }
    if (interactionStyles.length > 0) {
      componentMask |= INTERACTIONS_MASK;
    }
    if (interactionStyles.some(([name]) => name === 'hover')) {
      componentMask |= HOVER_INTERACTION_MASK;
    }
    // componentMask = (componentMask ^ -1) >>> 0;
    console.log('GROUP_MASK: ', {
      componentMask,
      // isParent: componentMask & GROUP_PARENT_MASK,
      // hasInteractions: Boolean(componentMask & INTERACTIONS_MASK),
      // hasHover: Boolean(componentMask & HOVER_INTERACTION_MASK),
      classNames,
      hash,
    });
    this.componentsState.set(hash, {
      interactionStyles,
      normalStyles: normalStyles.reduce((obj, d) => Object.assign(obj, d[1]), {}),
      mask: componentMask,
    });
    // this.listeners.forEach((l) => l());
    return Object.freeze(this.componentsState.get(hash)!);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: () => void) {
    this.listeners.delete(listener);
  }
}

export const tailwindManager = new TailwindManager();
