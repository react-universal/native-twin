import { useMemo } from 'react';
import {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
} from '../constants';
import { getStylesForPseudoClasses, createStylesheetForClass } from '../store/styles.handlers';
import type { IStyleType } from '../types';
import { getComponentClassNameSet, parseClassNames } from '../utils';

function getStyledProps(classPropsTuple: [string, string][], className: string) {
  const classNameSet = getComponentClassNameSet(className, classPropsTuple);
  const parsedClassNames = parseClassNames(classNameSet.join(' '));
  const baseStyles = parsedClassNames.normalClassNames.map((item): IStyleType => {
    return createStylesheetForClass(item);
  });

  const styledProps = classPropsTuple.reduce((acc, [key, value]) => {
    const styles = createStylesheetForClass(value);
    return {
      ...acc,
      [key]: styles,
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
