import { Component, createElement, forwardRef } from 'react';
import { getNormalizeConfig } from '../config';
import { JSXFunction } from '../runtime.types';

export const interopComponents = new Map<object | string, Parameters<JSXFunction>[0]>();

const ForwardRefSymbol = Symbol.for('react.forward_ref');

export const nativeTwinInterop = (baseComponent: any, mapping: any): any => {
  const configs = getNormalizeConfig(mapping);

  /**
   * Turns this:
   *   <View className="text-red-500" />
   * Into this:
   *   <View style={{ $$css: true, "text-red-500": "text-red-500"}} />
   */
  const interopComponent = forwardRef(function CssInteropComponent(
    { ...props }: Record<string, any>,
    ref: any,
  ) {
    if (props.cssInterop === false) {
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
      baseComponent.$$typeof === ForwardRefSymbol
    ) {
      delete props.cssInterop;
      return (baseComponent as any).render(props, props.ref);
    } else if (
      typeof baseComponent === 'function' &&
      !(baseComponent.prototype instanceof Component)
    ) {
      delete props.cssInterop;
      return (baseComponent as any)(props);
    } else {
      return createElement(baseComponent, props);
    }
  });
  interopComponent.displayName = `CssInterop.${
    baseComponent.displayName ?? baseComponent.name ?? 'unknown'
  }`;
  interopComponents.set(baseComponent, interopComponent);
  return interopComponent;
};

// On web, these are the same
export const remapProps = nativeTwinInterop;

export const useUnstableNativeVariable = (name: string) => {
  if (process.env.NODE_ENV !== 'production') {
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
