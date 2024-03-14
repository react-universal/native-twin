import { createElement, forwardRef } from 'react';
import { getNormalizeConfig } from '../config';
import { JSXFunction } from '../runtime.types';
import { getComponentType } from '../utils/getComponentType';
import { globalStyles, opaqueStyles } from './style-store';
import { interop } from './styled-component';
import { ComponentConfigOptions, ReactComponent } from './styled.types';

export const interopComponents = new Map<object | string, Parameters<JSXFunction>[0]>();

/**
 * Generates a new Higher-Order component the wraps the base component and applies the styles.
 * This is added to the `interopComponents` map so that it can be used in the `wrapJSX` function
 * @param baseComponent
 * @param mapping
 */
export const nativeTwinInterop = <
  const T extends ReactComponent<any>,
  const M extends ComponentConfigOptions<any>,
>(
  baseComponent: T,
  mapping: ComponentConfigOptions<T> & M,
): any => {
  let component: Parameters<JSXFunction>[0];
  const configs = getNormalizeConfig(mapping);
  const type = getComponentType(baseComponent);
  /**
   * This is a work-in-progress. We should be generating a new component that matches the
   * type of the previous component. E.g ForwardRef should be a ForwardRef, Memo should be Memo
   */
  if (type === 'function') {
    component = (props: Record<string, any>): any => {
      // console.debug('PROPS_FUNCTION: ', props);
      return interop(baseComponent, configs, props, undefined);
    };
  } else {
    component = forwardRef<unknown, Record<string, any>>((props, ref): any => {
      // console.debug('PROPS_FORWARD: ', props);
      // This function will change className->style, add the extra props and do the "magic"
      return interop(baseComponent, configs, props, ref);
      // `interop` will return createElement(baseComponent, propsWithStylesAppliedAndEventHandlersAdded);
    });
  }

  const name = baseComponent.displayName ?? baseComponent.name ?? 'unknown';
  component.displayName = `NativeTwinStyled.${name}`;
  interopComponents.set(baseComponent, component);

  return component;
};

export const remapProps = <
  const T extends ReactComponent<any>,
  const M extends ComponentConfigOptions<any>,
>(
  component: any,
  mapping: ComponentConfigOptions<T> & M,
): any => {
  const configs = getNormalizeConfig(mapping);

  const interopComponent = forwardRef(function RemapPropsComponent(
    { ...props }: Record<string, any>,
    ref: any,
  ) {
    for (const config of configs) {
      let rawStyles = [];

      const source = props?.[config.source];

      // If the source is not a string or is empty, skip this config
      if (typeof source !== 'string' || !source) continue;

      delete props[config.source];

      for (const className of source.split(/\s+/)) {
        const signal = globalStyles.get(className);

        if (signal !== undefined) {
          const style = {};
          const styleRuleSet = signal.get();
          opaqueStyles.set(style, styleRuleSet);
          rawStyles.push(style);
        }
      }

      if (rawStyles.length !== 0) {
        const existingStyle = props[config.target];

        if (Array.isArray(existingStyle)) {
          rawStyles.push(...existingStyle);
        } else if (existingStyle) {
          rawStyles.push(existingStyle);
        }

        props[config.target] = rawStyles.length === 1 ? rawStyles[0] : rawStyles;
      }
    }

    props.ref = ref;
    return createElement(component as any, props, props.children);
  });

  interopComponents.set(component as any, interopComponent);
  return interopComponent;
};
