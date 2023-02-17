import { useCallback, useMemo } from 'react';
import produce from 'immer';
import { tailwindStore } from '../store';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';
import { transformClassNames } from '../utils/styles.utils';

function useClassNamesTransform(classNames: string) {
  const parsed = useMemo(() => parseClassNames(classNames), [classNames]);
  const compileClassName = useCallback((className: string) => {
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
  }, []);

  const normalStyles: IStyleType = useMemo(() => {
    let styles = {};
    for (const node of parsed.normalClassNames) {
      const compiled = compileClassName(node);
      Object.assign(styles, compiled);
    }
    return styles;
  }, [parsed.normalClassNames, compileClassName]);

  const interactionStyles = useMemo(() => {
    let interactionStyles: IComponentInteractions[] = [];
    const interactionsClasses = parsePseudoElements(parsed.interactionClassNames);
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
    return interactionStyles;
  }, [parsed, compileClassName]);

  return {
    normalStyles,
    interactionStyles,
    parsed,
  };
}

export { useClassNamesTransform };
