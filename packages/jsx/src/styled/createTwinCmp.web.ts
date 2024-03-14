import { Component, createElement, forwardRef } from 'react';
import { REACT_FORWARD_REF_SYMBOL } from '../constants';
import type { JSXFunction, JSXInternalProps } from '../types/jsx.types';
import { getNormalizeConfig } from '../utils/config.utils';

export const stylizedComponents = new Map<object | string, Parameters<JSXFunction>[0]>();

export const createStylableComponent = (baseComponent: any, mapping: any): any => {
  const configs = getNormalizeConfig(mapping);

  /**
   * Turns this:
   *   <View className="text-red-500" />
   * Into this:
   *   <View style={{ $$css: true, "text-red-500": "text-red-500"}} />
   */
  const twinComponent = forwardRef(function TwinComponent(
    { ...props }: JSXInternalProps,
    ref: any,
  ) {
    if (props['twEnabled'] === false) {
      return createElement(baseComponent, props);
    }

    props = { ...props, ref };
    for (const config of configs) {
      let newStyles: any = [];
      const source = props[config.source];
      const target: any = props[config.target];

      // Ensure we only add non-empty strings
      if (typeof source === 'string' && source) {
        newStyles.push({
          $$css: true,
          [source]: source,
        } as any);
      }

      delete props[config.source];

      if (Array.isArray(target)) {
        newStyles.push(...target);
      } else if (target) {
        newStyles.push(target);
      }

      if (newStyles.length > 0) {
        props[config.target] = newStyles;
      }
    }

    if (
      '$$typeof' in baseComponent &&
      typeof baseComponent === 'function' &&
      baseComponent.$$typeof === REACT_FORWARD_REF_SYMBOL
    ) {
      delete props?.['twEnabled'];
      return (baseComponent as any).render(props, props['ref']);
    } else if (
      typeof baseComponent === 'function' &&
      !(baseComponent.prototype instanceof Component)
    ) {
      delete props?.['twEnabled'];
      return (baseComponent as any)(props);
    } else {
      return createElement(baseComponent, props);
    }
  });
  twinComponent.displayName = `Twin.${
    baseComponent.displayName ?? baseComponent.name ?? 'unknown'
  }`;
  stylizedComponents.set(baseComponent, twinComponent);
  return twinComponent;
};

export const withMappedProps = createStylableComponent;

export const useUnstableNativeVariable = (name: string) => {
  if (process.env['NODE_ENV'] !== 'production') {
    console.log('useUnstableNativeVariable is not supported on web.');
  }
  return undefined;
};

export function vars<T extends Record<`--${string}`, string | number>>(variables: T) {
  const $variables: Record<string, string> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (key.startsWith('--')) {
      $variables[key] = value.toString();
    } else {
      $variables[`--${key}`] = value.toString();
    }
  }
  return $variables;
}

export function useSafeAreaEnv(): {} | undefined {
  return undefined;
}
