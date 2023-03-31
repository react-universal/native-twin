import { useCallback, useMemo } from 'react';
import { InteractionPseudoSelectors } from '../constants';
import {
  getClassesForSelectors,
  parseClassNames,
  splitClassNames,
  stylesStore,
} from '../store/stylesheet.store';
import type { IInteractionPayload, IStyleType } from '../types';
import { cssPropertiesResolver } from '../utils';

function useClassNamesToCss(className: string, classPropsTuple: [string, string][]) {
  const classNameSet = useMemo(() => {
    const baseClasses = splitClassNames(className);
    if (!classPropsTuple) return baseClasses;

    const fullSet = classPropsTuple.reduce((prev, current) => {
      const classes = splitClassNames(current[1]);
      return prev.concat(classes);
    }, baseClasses);
    return fullSet;
  }, [className, classPropsTuple]);

  const componentStyles = useMemo(() => {
    const parsedClassNames = parseClassNames(classNameSet.join(' '));
    const baseStyles = parsedClassNames.normalClassNames.map((item): [string, IStyleType] => {
      const styles = stylesStore[item];
      const rnStyles = cssPropertiesResolver(styles?.JSS || {});
      return [item, rnStyles];
    });
    return {
      baseStyles,
      parsedClassNames,
    };
  }, [classNameSet]);

  const getStylesForPseudoClasses = useCallback(function <T>(
    classNames: string[][],
    pseudoSelectors: readonly T[],
  ) {
    let pseudoSelectorStyles: [T, IInteractionPayload][] = [];
    const pseudoSelectorClasses = getClassesForSelectors(classNames, pseudoSelectors);
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
      const compiled = stylesStore[selectorClassNames];
      pseudoSelectorStyles.push([
        selectorType,
        {
          classNames: selectorClassNames,
          styles: cssPropertiesResolver(compiled?.JSS ?? {}),
        },
      ]);
    }
    return pseudoSelectorStyles;
  },
  []);

  return {
    componentStyles: componentStyles.baseStyles,
    classPropsTuple,
    hasGroupInteractions: classNameSet.some((item) => item.includes('group-')),
    hasPointerInteractions: componentStyles.parsedClassNames.interactionClassNames.length > 0,
    isGroupParent: classNameSet.some((item) => item === 'group'),
    interactionStyles: getStylesForPseudoClasses(
      componentStyles.parsedClassNames.interactionClassNames,
      InteractionPseudoSelectors,
    ),
  };
}

export { useClassNamesToCss };
