import { createElement, forwardRef, useContext } from 'react';
import { groupContext, TwinRootContext } from '../../context/styled.context';
import type { JSXFunction } from '../../types/jsx.types';
import type { ReactComponent, StylableComponentConfigOptions } from '../../types/styled.types';
import { getNormalizeConfig } from '../../utils/config.utils';
import { getComponentDisplayName, getComponentType } from '../../utils/react.utils';
import { useStyledProps } from '../hooks/useStyledProps';
import { renderComponent } from './renderComponent';

export const stylizedComponents = new Map<object | string, Parameters<JSXFunction>[0]>();

export function NativeTwinHOC<
  const T extends ReactComponent<any>,
  const M extends StylableComponentConfigOptions<any>,
>(Component: Parameters<JSXFunction>[0], mapping: StylableComponentConfigOptions<T> & M) {
  const component: any = Component;
  const configs = getNormalizeConfig(mapping);

  const TwinComponent = forwardRef(function NativeTwinHOC(props: any, ref: any) {
    const { compiledProps, state, registry, handlers } = useStyledProps(props, configs);
    const twinRoot = useContext(TwinRootContext);
    const newProps = {
      ...props,
      ...handlers,
    };

    for (const propKey in compiledProps) {
      // console.log('llll',propKey)
      const oldProps = newProps[propKey] ? { ...newProps[propKey] } : {};
      newProps[propKey] = Object.assign({}, compiledProps[propKey], oldProps);
    }

    if (state.meta.isGroupParent) {
      return createElement(
        groupContext.Provider,
        { value: registry.id },
        createElement(component, newProps),
      );
    }

    // if (props?.['__twinID']) {
    //   console.log('ID: ', { props, ref });
    // }

    if (twinRoot) {
      return renderComponent(component, newProps, ref);
    }

    if (component === Component) {
      switch (getComponentType(component)) {
        case 'forwardRef': {
          const ref = newProps['ref'];
          delete newProps['ref'];
          return (component as any).render(newProps, ref);
        }
        case 'function':
          return (component as any)(newProps);
        case 'string':
        case 'object':
        case 'class':
        case 'unknown':
          return createElement(component, newProps);
      }
    } else {
      return createElement(component, newProps);
    }
  });
  stylizedComponents.set(Component, TwinComponent);

  if (__DEV__) {
    TwinComponent.displayName = `Twin.${getComponentDisplayName(Component)}`;
  }

  return TwinComponent;
}

export const createStylableComponent = NativeTwinHOC;
