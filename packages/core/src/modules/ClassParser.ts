import { setup } from '@react-universal/native-tailwind';
import type { IClassNamesStyle } from '../store/store';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleTuple, IStyleType } from '../types/styles.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';
import { createHash } from '../utils/createHash';
import { cssPropertiesResolver } from './resolve';

export type TComponentsSnapshot = Record<number, IClassNamesStyle>;

class ClassParser {
  componentsState: TComponentsSnapshot = { 0: { interactionStyles: [], normalStyles: {} } };
  stylesCollection: Map<string, { generated: IStyleType }> = new Map();
  private listeners = new Set<() => void>();
  private tw = setup({ content: ['__'] });

  private getStringHash(input: string) {
    return createHash(input);
  }
  private getCachedComponent(hash: number) {
    return this.componentsState[hash];
  }

  private getJSS(classNames: string[]) {
    console.groupCollapsed('getJSS');
    const styleTuple = classNames.reduce((previous, current) => {
      const cache = this.stylesCollection.get(current);
      if (cache) {
        console.log('getJSS_CACHE_HIT: ', current);
        previous.push([current, cache.generated]);
      } else {
        console.log('getJSS_CACHE_MISS: ', current);
        const styles = this.tw(current);
        const rnStyles = cssPropertiesResolver(styles.JSS);
        previous.push([current, rnStyles]);
        this.stylesCollection.set(current, {
          generated: rnStyles,
        });
      }
      return previous;
    }, [] as IStyleTuple[]);
    console.table(styleTuple);
    console.groupEnd();

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
          styles: compiled,
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
      return this.componentsState[hash];
    }

    const parsed = parseClassNames(classNames);
    const normalStyles = this.getJSS(parsed.normalClassNames);
    const interactionStyles = this.getStylesForInteractionClasses(
      parsed.interactionClassNames,
    );
    this.componentsState[hash] = {
      interactionStyles,
      normalStyles,
    };
    return Object.freeze(this.componentsState[hash]);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: () => void) {
    this.listeners.delete(listener);
  }
}

export const classNameParser = new ClassParser();
