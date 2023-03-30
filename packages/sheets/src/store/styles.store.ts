import produce, { enableMapSet } from 'immer';
import type { TValidInteractionPseudoSelectors } from '../constants';
import { css } from '../css';
import type { IInteractionPayload, IStyleTuple, IStyleType } from '../types';
import { cssPropertiesResolver } from '../utils';

enableMapSet();

export interface IComponentRegistry {
  id: string;
  parentID?: string;
  interactionState: Record<TValidInteractionPseudoSelectors, boolean>;
  baseStyles: IStyleTuple[];
  hasGroupInteractions: boolean;
  hasPointerInteractions: boolean;
  isGroupParent: boolean;
}
const StylesCache = new Map<string, IStyleType>();
export const ComponentsRegistry = new Map<string, IComponentRegistry>();
const subscripted = new Set<() => void>();

export function subscribeToComponent(callback: () => void) {
  subscripted.add(callback);
  return () => {
    subscripted.delete(callback);
  };
}

export function getComponentByID(id: string) {
  return ComponentsRegistry.get(id);
}

export const styleSheetApiHelpers = {
  parseClassNames(classNames = '') {
    const rawClassNames = this.splitClassNames(classNames);
    const normalClassNames = rawClassNames.filter((item) => !item.includes(':'));
    const interactionClassNames = rawClassNames
      .filter((item) => item.includes(':'))
      .map((item) => item.split(':'));
    return {
      interactionClassNames,
      normalClassNames,
    };
  },
  splitClassNames(classNames = '') {
    const rawClassNames = classNames
      ?.replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(
        (className) =>
          className !== '' && className !== 'undefined' && typeof className !== 'undefined',
      );
    return rawClassNames;
  },

  getClassesForSelectors<T>(classNames: string[][], selectors: readonly T[]) {
    const classes: [T, string][] = [];
    for (const current of classNames) {
      if (!current[0] || !current[1]) continue;
      const pseudoSelector = current[0];
      const className = current[1];
      if (selectors.includes(pseudoSelector as T)) {
        classes.push([pseudoSelector as T, className]);
      }
    }
    return classes;
  },

  getStylesForPseudoClasses<T>(classNames: string[][], pseudoSelectors: readonly T[]) {
    let pseudoSelectorStyles: [T, IInteractionPayload][] = [];
    const pseudoSelectorClasses = this.getClassesForSelectors(classNames, pseudoSelectors);
    const tupleUnion = pseudoSelectorClasses.reduce((prev, current) => {
      const [selectorType, selectorClassNames] = current;
      const index = prev.findIndex((d) => d[0] === selectorType);
      if (index !== -1 && index in prev) {
        prev[index] = [selectorType, `${prev[index]?.[1]} ${selectorClassNames}`];
      } else {
        prev.push([selectorType, selectorClassNames]);
      }
      return prev;
    }, [] as [T, string][]);
    for (const node of tupleUnion) {
      const selectorType = node[0];
      const selectorClassNames = node[1];
      const compiled = this._getJSS([selectorClassNames]);
      pseudoSelectorStyles.push([
        selectorType,
        {
          classNames: selectorClassNames,
          styles: compiled.reduce((obj, d) => Object.assign(obj, d[1]), {}),
        },
      ]);
    }
    return pseudoSelectorStyles;
  },

  _getJSS(classNames: string[]) {
    const nonProcessedClassNames = classNames.filter((name) => !StylesCache.has(name));
    for (const currentClassName of nonProcessedClassNames) {
      const styles = css(currentClassName);
      const rnStyles = cssPropertiesResolver(styles.JSS);
      StylesCache.set(currentClassName, rnStyles);
    }
    const styleTuple = classNames.reduce((previous, current) => {
      const cache = StylesCache.get(current);
      if (cache) {
        previous.push([current, cache]);
      } else {
        throw new Error('NO_CACHE_HIT');
      }
      return previous;
    }, [] as IStyleTuple[]);

    return styleTuple;
  },
};

export function setInteractionState(
  id: string,
  interaction: TValidInteractionPseudoSelectors,
  value: boolean,
) {
  produce(ComponentsRegistry, (draft) => {
    if (draft.has(id)) {
      draft.get(id)!.interactionState[interaction] = value;
    }
    subscripted.forEach((l) => l());
  });
  return true;
}

export function registerComponentInStore(
  classNameSet: string[],
  id: string,
  parentID?: string,
) {
  console.log('REGISTER_COMPONENT: ', { id, classNameSet, parentID });
  const parsedClassNames = styleSheetApiHelpers.parseClassNames(classNameSet.join(' '));
  const baseStyles = styleSheetApiHelpers._getJSS(parsedClassNames.normalClassNames);
  const hasGroupInteractions = parsedClassNames.interactionClassNames.some(([selector]) =>
    selector?.includes('group-'),
  );
  const hasPointerInteractions = parsedClassNames.interactionClassNames.length > 0;
  const isGroupParent = classNameSet.some((name) => name === 'group');
  produce(ComponentsRegistry, (draft) => {
    draft.set(id, {
      id,
      interactionState: {
        'group-hover': false,
        active: false,
        focus: false,
        hover: false,
      },
      baseStyles,
      hasGroupInteractions,
      hasPointerInteractions,
      isGroupParent,
      parentID,
    });
  });
  return id;
}
