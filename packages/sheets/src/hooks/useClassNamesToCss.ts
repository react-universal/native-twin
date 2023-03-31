import { useMemo } from 'react';
import { InteractionPseudoSelectors } from '../constants';
import {
  getStylesForPseudoClasses,
  parseClassNames,
  getComponentClassNameSet,
  stylesStore,
} from '../store/stylesheet.store';
import type { IStyleType } from '../types';
import { cssPropertiesResolver } from '../utils';

function useClassNamesToCss(className: string, classPropsTuple: [string, string][]) {
  const classNameSet = useMemo(
    () => getComponentClassNameSet(className, classPropsTuple),
    [className, classPropsTuple],
  );

  const componentStyles = useMemo(() => {
    const parsedClassNames = parseClassNames(classNameSet.join(' '));
    const baseStyles = parsedClassNames.normalClassNames.map((item): IStyleType => {
      const styles = stylesStore[item];
      const rnStyles = cssPropertiesResolver(styles?.JSS || {});
      return rnStyles;
    });
    return {
      baseStyles,
      parsedClassNames,
    };
  }, [classNameSet]);

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
