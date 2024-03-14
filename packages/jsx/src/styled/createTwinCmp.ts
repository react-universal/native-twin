import { forwardRef } from 'react';
import type { JSXFunction } from '../types/jsx.types';
import type { StylableComponentConfigOptions, ReactComponent } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/config.utils';
import { getComponentType } from '../utils/react.utils';
import { twinComponent } from './twinCmp';

export const stylizedComponents = new Map<object | string, Parameters<JSXFunction>[0]>();

/**
 * Generates a new Higher-Order component the wraps the base component and applies the styles.
 * This is added to the `stylizedComponents` map so that it can be used in the `wrapJSX` function
 * @param baseComponent
 * @param mapping
 */
export const createStylableComponent = <
  const T extends ReactComponent<any>,
  const M extends StylableComponentConfigOptions<any>,
>(
  baseComponent: T,
  mapping: StylableComponentConfigOptions<T> & M,
) => {
  let component: Parameters<JSXFunction>[0];
  const configs = getNormalizeConfig(mapping);
  const type = getComponentType(baseComponent);
  /**
   * This is a work-in-progress. We should be generating a new component that matches the
   * type of the previous component. E.g ForwardRef should be a ForwardRef, Memo should be Memo
   */
  if (type === 'function') {
    component = (props: Record<string, any>): any => {
      // if (props && !props['configs']) {
      //   props['configs'] = configs;
      // }
      return twinComponent(baseComponent, configs, props, undefined);
    };
  } else {
    component = forwardRef<unknown, Record<string, any>>((props, ref): any => {
      // if (props && !props['configs']) {
      //   props['configs'] = configs;
      // }
      return twinComponent(baseComponent, configs, props, ref);
    });
  }

  const name = baseComponent.displayName ?? baseComponent.name ?? 'unknown';
  component.displayName = `Twin.${name}`;
  component.defaultProps = {
    configs,
  };
  stylizedComponents.set(baseComponent, component);

  return component;
};
