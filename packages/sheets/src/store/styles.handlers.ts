import { setup } from '@universal-labs/core';
import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';
import {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  InteractionPseudoSelectors,
  PlatformPseudoSelectors,
} from '../constants';
import type { IStyleType } from '../types';
import { cssPropertiesResolver, getClassesForSelectors, parseClassNames } from '../utils';
import { createHash } from '../utils/createHash';
import {
  getComponentClassNameSet,
  parseInteractionClassNames,
  splitClassNames,
} from '../utils/helpers';
import { globalStore } from './global.store';

let currentTailwindConfig: Config = {
  content: ['__'],
  corePlugins: { preflight: false },
  presets: [reactNativeTailwindPreset({ baseRem: 16 })],
};

function setTailwindConfig(config: Config) {
  currentTailwindConfig = config;
}

let cssProcessor = function (className: string) {
  // @ts-expect-error
  return setup(this.tailwindConfig).css(className);
};

function getStoredClassName(className: string) {
  return globalStore.getState().stylesRegistry.get(className)!;
}

function getStyledProps(classPropsTuple: [string, string][], className: string) {
  const baseStyles = getStylesForClassProp(className);
  const classNameSet = getComponentClassNameSet(className, classPropsTuple);
  const parsedClassNames = parseClassNames(classNameSet.join(' '));
  // const baseStyles = parsedClassNames.normalClassNames.map((item): IStyleType => {
  //   return createStylesheetForClass(item);
  // });

  const styledProps = classPropsTuple.reduce((acc, [key, value]) => {
    const styles = getStylesForClassProp(value);
    return {
      ...acc,
      [key]: styles,
    };
  }, {});

  return Object.assign({}, { styledProps }, { style: baseStyles, parsedClassNames });
}

function composeStylesForPseudoClasses<T extends string>(
  styleTuples: [T, IStyleType][],
  pseudoSelector: T,
) {
  return styleTuples
    .filter(([selectorName]) => selectorName === pseudoSelector)
    .map(([, selectorStyles]) => selectorStyles);
}

function getStylesForClassProp(classNames?: string) {
  const splittedBasicClasses = parseClassNames(classNames);
  const splittedInteractionClasses = parseInteractionClassNames(classNames);
  const result: IStyleType[] = [];
  let unprocessed: string[] = [];
  const hash = createHash(classNames ?? 'non-classes');
  const classNamesCollectionCache = globalStore.getState().componentStylesRegistry.get(hash);
  if (classNamesCollectionCache) {
    return classNamesCollectionCache;
  }
  for (const currentClassName of splittedBasicClasses) {
    const storedStyle = getStoredClassName(currentClassName);
    if (storedStyle) {
      result.push(storedStyle);
      continue;
    }
    unprocessed.push(currentClassName);
  }

  if (unprocessed.length > 0) {
    const compiled = cssProcessor.call(
      { tailwindConfig: currentTailwindConfig },
      unprocessed.join(' '),
    );
    Object.keys(compiled.JSS).forEach((key) => {
      let cssProp = key.replace('.', '');
      cssProp = cssProp.replace(/\\/g, '');
      const styles = cssPropertiesResolver({
        [cssProp]: compiled.JSS[key],
      });
      result.push(styles);
      globalStore.setState((prevState) => {
        prevState.stylesRegistry.set(cssProp, styles);
        return prevState;
      }, false);
    });
  }
  const childStyles = getStylesForPseudoClasses(
    Object.entries(splittedInteractionClasses),
    ChildPseudoSelectors,
  );
  globalStore.setState((prevState) => {
    prevState.componentStylesRegistry.set(hash, {
      styles: result,
      interactionStyles: getStylesForPseudoClasses(
        Object.entries(splittedInteractionClasses),
        InteractionPseudoSelectors,
      ),
      classNamesSet: splitClassNames(classNames),
      platformStyles: getStylesForPseudoClasses(
        Object.entries(splittedInteractionClasses),
        PlatformPseudoSelectors,
      ),
      appearanceStyles: getStylesForPseudoClasses(
        Object.entries(splittedInteractionClasses),
        AppearancePseudoSelectors,
      ),
      childStyles,
      getChildStyles: (meta) => {
        const result: IStyleType[] = [];
        if (meta.isFirstChild) {
          result.push(...composeStylesForPseudoClasses(childStyles, 'first'));
        }
        if (meta.isLastChild) {
          result.push(...composeStylesForPseudoClasses(childStyles, 'last'));
        }
        if (meta.nthChild % 2 === 0) {
          result.push(...composeStylesForPseudoClasses(childStyles, 'even'));
        }
        if (meta.nthChild % 2 !== 0) {
          result.push(...composeStylesForPseudoClasses(childStyles, 'odd'));
        }
        return result;
      },
    });
    return prevState;
  });
  return globalStore.getState().componentStylesRegistry.get(hash)!;
}

function getStylesForPseudoClasses<T>(classNames: string[][], pseudoSelectors: readonly T[]) {
  let pseudoSelectorStyles: [T, IStyleType][] = [];
  const pseudoSelectorClasses = getClassesForSelectors(classNames, pseudoSelectors);
  for (const [selectorType, selectorClassNames] of pseudoSelectorClasses) {
    getStylesForClassProp(selectorClassNames);
    pseudoSelectorStyles.push([
      selectorType,
      globalStore.getState().stylesRegistry.get(selectorClassNames)!,
    ]);
  }
  return pseudoSelectorStyles;
}

export {
  getClassesForSelectors,
  getStylesForPseudoClasses,
  setTailwindConfig,
  getStylesForClassProp,
  getStyledProps,
};
