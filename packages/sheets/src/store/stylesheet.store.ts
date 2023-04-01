import { setup } from '@universal-labs/core';
import { reactNativeTailwindPreset } from '@universal-labs/core/tailwind/preset';
import type { Config } from 'tailwindcss';
import type { IStyleType } from '../types';
import { cssPropertiesResolver } from '../utils';

type CssResult = ReturnType<ReturnType<typeof setup>['css']>;

type SubscriptionsCallBack<T> = (currentState: T) => void;

export function parseClassNames(classNames = '') {
  const rawClassNames = splitClassNames(classNames);
  const normalClassNames = rawClassNames.filter((item) => !item.includes(':'));
  const interactionClassNames = rawClassNames
    .filter((item) => item.includes(':'))
    .map((item) => item.split(':'));
  return {
    interactionClassNames,
    normalClassNames,
  };
}

export function splitClassNames(classNames = '') {
  const rawClassNames = classNames
    ?.replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(
      (className) =>
        className !== '' && className !== 'undefined' && typeof className !== 'undefined',
    );
  return rawClassNames;
}

export function getClassesForSelectors<T>(classNames: string[][], selectors: readonly T[]) {
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
}

let cssProcessor = function (className: string) {
  // @ts-expect-error
  return setup(this.tailwindConfig).css(className);
};

function createInternalStore<StoreShape extends object>(initialState: StoreShape) {
  const listeners = new Set<SubscriptionsCallBack<StoreShape>>();
  let currentTailwindConfig: Config = {
    content: ['__'],
    corePlugins: { preflight: false },
    presets: [reactNativeTailwindPreset({ baseRem: 16 })],
  };
  const subscribe = (listener: (state: StoreShape) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  function setTailwindConfig(config: Config) {
    currentTailwindConfig = config;
  }

  return new Proxy(
    {
      ...initialState,
      setTailwindConfig,
      subscribe,
    },
    {
      get(target: StoreShape, key: string) {
        if (Reflect.has(target, key)) {
          // console.log('READ_FROM_CACHE', key);
          return Reflect.get(target, key);
        }
        const styles = cssProcessor.call({ tailwindConfig: currentTailwindConfig }, key);
        Reflect.set(target, key, styles);
        return Reflect.get(target, key);
      },
      set(target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
      },
    },
  ) as StoreShape & {
    subscribe: typeof subscribe;
    setTailwindConfig: typeof setTailwindConfig;
  };
}

export const stylesStore = createInternalStore<Record<string, CssResult>>({});

const setTailwindConfig = (config: Config) =>
  Reflect.get(stylesStore, 'setTailwindConfig')(config);

function getStylesForPseudoClasses<T>(classNames: string[][], pseudoSelectors: readonly T[]) {
  let pseudoSelectorStyles: [T, IStyleType][] = [];
  const pseudoSelectorClasses = getClassesForSelectors(classNames, pseudoSelectors);
  for (const node of pseudoSelectorClasses) {
    const selectorType = node[0];
    const selectorClassNames = node[1];
    const compiled = stylesStore[selectorClassNames];
    pseudoSelectorStyles.push([selectorType, cssPropertiesResolver(compiled?.JSS ?? {})]);
  }
  return pseudoSelectorStyles;
}

function getComponentClassNameSet(className: string, classPropsTuple: [string, string][]) {
  const baseClasses = splitClassNames(className);
  if (!classPropsTuple) return baseClasses;

  const fullSet = classPropsTuple.reduce((prev, current) => {
    const classes = splitClassNames(current[1]);
    return prev.concat(classes);
  }, baseClasses);
  return fullSet;
}

export {
  createInternalStore,
  setTailwindConfig,
  getStylesForPseudoClasses,
  getComponentClassNameSet,
};
