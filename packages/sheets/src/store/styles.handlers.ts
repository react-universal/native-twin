import { setup } from '@universal-labs/core';
import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';
import type { IStyleType } from '../types';
import { cssPropertiesResolver, getClassesForSelectors, parseClassNames, splitClassNames } from '../utils';
import { createHash } from '../utils/createHash';
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

function getStylesByHash(hash: number) {
  return globalStore.getState().componentStylesRegistry.get(hash);
}

function processClassnames(classNames: string) {
  const splittedClasses = parseClassNames(classNames);
  const baseClasses = splittedClasses.normalClassNames;
  const baseClassesHash = createHash(baseClasses.join(''));
  const cache = getStylesByHash(baseClassesHash);
  if (cache) {
    return cache;
  }
  
}

function createStylesheetForClass(className: string) {
  const cache = globalStore.getState().stylesRegistry.get(className);
  if (cache) {
    console.log('CACHE_HIT');
    return cache;
  }
  const compiled = cssProcessor.call({ tailwindConfig: currentTailwindConfig }, className);
  const styles = cssPropertiesResolver(compiled.JSS);
  globalStore.setState((prevState) => {
    prevState.stylesRegistry.set(className, styles);
    return prevState;
  });
  // stylesStore[className] = StyleSheet.create({
  //   [className]: styles,
  // });
  return globalStore.getState().stylesRegistry.get(className)!;
}

function getStylesForPseudoClasses<T>(classNames: string[][], pseudoSelectors: readonly T[]) {
  let pseudoSelectorStyles: [T, IStyleType][] = [];
  const pseudoSelectorClasses = getClassesForSelectors(classNames, pseudoSelectors);
  for (const node of pseudoSelectorClasses) {
    const selectorType = node[0];
    const selectorClassNames = node[1];
    if (globalStore.getState().stylesRegistry.has(selectorClassNames)) {
      pseudoSelectorStyles.push([
        selectorType,
        globalStore.getState().stylesRegistry.get(selectorClassNames)!,
      ]);
    } else {
      const compiled = cssProcessor.call(
        { tailwindConfig: currentTailwindConfig },
        selectorClassNames,
      );
      globalStore.setState((prevState) => {
        prevState.stylesRegistry.set(selectorClassNames, cssPropertiesResolver(compiled.JSS));
        return prevState;
      });
      pseudoSelectorStyles.push([
        selectorType,
        globalStore.getState().stylesRegistry.get(selectorClassNames)!,
      ]);
    }
  }
  return pseudoSelectorStyles;
}

export {
  getClassesForSelectors,
  getStylesForPseudoClasses,
  createStylesheetForClass,
  setTailwindConfig,
};
