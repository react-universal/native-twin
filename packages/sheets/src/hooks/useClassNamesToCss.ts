import { useMemo } from 'react';
import {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
} from '../constants';
import {
  getStylesForPseudoClasses,
  parseClassNames,
  getComponentClassNameSet,
  stylesStore,
} from '../store/stylesheet.store';
import type { IStyleType } from '../types';
import { cssPropertiesResolver } from '../utils';

function getStyledProps(classPropsTuple: [string, string][], className: string) {
  const classNameSet = getComponentClassNameSet(className, classPropsTuple);
  const parsedClassNames = parseClassNames(classNameSet.join(' '));
  const baseStyles = parsedClassNames.normalClassNames.map((item): IStyleType => {
    const styles = stylesStore[item];
    const rnStyles = cssPropertiesResolver(styles?.JSS || {});
    return rnStyles;
  });
  const styledProps = classPropsTuple.reduce((acc, [key, value]) => {
    const styles = stylesStore[value];
    const rnStyles = cssPropertiesResolver(styles?.JSS || {});
    return {
      ...acc,
      [key]: rnStyles,
    };
  }, {});
  return Object.assign(
    {},
    { styledProps },
    { style: baseStyles, parsedClassNames },
    {
      hasGroupInteractions: classNameSet.some((item) => item.includes('group-')),
      hasPointerInteractions: parsedClassNames.interactionClassNames.length > 0,
      isGroupParent: classNameSet.some((item) => item === 'group'),
      interactionStyles: getStylesForPseudoClasses(
        parsedClassNames.interactionClassNames,
        InteractionPseudoSelectors,
      ),
      platformStyles: getStylesForPseudoClasses(
        parsedClassNames.interactionClassNames,
        PlatformPseudoSelectors,
      ),
      appearanceStyles: getStylesForPseudoClasses(
        parsedClassNames.interactionClassNames,
        AppearancePseudoSelectors,
      ),
      childStyles: getStylesForPseudoClasses(
        parsedClassNames.interactionClassNames,
        ChildPseudoSelectors,
      ),
    },
  );
}

function useClassNamesToCss(className: string, classPropsTuple: [string, string][]) {
  const componentStyles = useMemo(
    () => getStyledProps(classPropsTuple, className),
    [className, classPropsTuple],
  );

  return componentStyles;
}

export { useClassNamesToCss };
