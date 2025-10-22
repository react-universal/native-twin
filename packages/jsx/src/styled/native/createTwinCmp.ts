import { FiberProvider } from 'its-fine';
import { createElement, forwardRef, useContext } from 'react';
import { groupContext, TwinRootContext } from '../../context/styled.context.js';
import type { JSXFunction } from '../../types/jsx.types.js';
import type { ReactComponent, StylableComponentConfigOptions } from '../../types/styled.types.js';
import { getNormalizeConfig } from '../../utils/config.utils.js';
import { getComponentDisplayName, getComponentType } from '../../utils/react.utils.js';
import { useStyledProps } from '../hooks/useStyledProps.js';
import { renderComponent } from './renderComponent.js';

export const stylizedComponents = new Map<object | string, Parameters<JSXFunction>[0]>();

export function NativeTwinHOC<
  const T extends ReactComponent<any>,
  const M extends StylableComponentConfigOptions<any>,
>(Component: Parameters<JSXFunction>[0], mapping: StylableComponentConfigOptions<T> & M) {
  const component: any = Component;
  const configs = getNormalizeConfig(mapping);

  const TwinComponent = forwardRef(function NativeTwinHOC(props: any, ref: any) {
    const { componentHandler, compiledProps, handlers } = useStyledProps(props, configs);
    const twinRoot = useContext(TwinRootContext);
    const newProps = {
      ...props,
      ...handlers,
    };

    if (compiledProps.length > 0) {
      for (const style of compiledProps) {
        const oldProps = newProps[style.target] ? { ...newProps[style.target] } : {};
        newProps[style.target] = Object.assign({}, style.styles, oldProps);
      }
    }

    if (!twinRoot) {
      return createElement(
        FiberProvider,
        null,
        createElement(
          TwinRootContext.Provider,
          { value: true },
          createElement(component, newProps),
        ),
      );
    }

    if (componentHandler.metadata.isGroupParent) {
      return createElement(
        groupContext.Provider,
        { value: componentHandler.id },
        createElement(component, newProps),
      );
    }

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
    TwinComponent.displayName = `Twin(${getComponentDisplayName(Component)})`;
  }

  return TwinComponent;
}

export const createStylableComponent = NativeTwinHOC;
