import { ComponentType, createElement, useRef } from 'react';
import { groupContext } from '../context';
import { JSXStyledProps } from '../jsx/jsx-custom-props';
import { useTwinStore } from '../store/twin.store';
import type { ComponentConfig } from '../types/styled.types';
import { getComponentType } from '../utils/react.utils';

export function twinComponent(
  baseComponent: ComponentType<any>,
  configs: ComponentConfig[],
  props: Record<string, any> | null,
  ref: any,
) {
  let component = baseComponent;
  // const providerValues = useTwinProvider();
  // const [isParentActive, setParentState] = useTwinContext(props?.['styledProps']);

  const { state, onChange, id, parentState } = useTwinStore(props?.['styledProps']);
  const renderCount = useRef(0);

  props = Object.assign({ ref }, props);
  if (props['className']) {
    console.group('CLASSES: ', props['className']);
    console.log('RENDER_COUNT: ', ++renderCount.current);
    console.log('STORE: ', state);
    console.log('PARENT: ', parentState);
    console.groupEnd();
  }

  if (props['styledProps']) {
    const styledProps = props['styledProps'] as JSXStyledProps[];

    for (const style of styledProps) {
      props[style[0]] = style[1].getStyles({
        isParentActive: parentState.isGroupActive,
        isPointerActive: state.interactions.isLocalActive,
      });
    }
  }

  for (const x of configs) {
    if (x.target !== x.source) {
      delete props[x.source];
    }
  }

  if (state.meta.hasPointerEvents || state.meta.hasGroupEvents) {
    props['onTouchStart'] = (event: unknown) => {
      ref?.['onTouchStart']?.(event);
      // setIsOwnPointerActive(true);
      onChange(true);
    };
    props['onTouchEnd'] = (event: unknown) => {
      ref?.['onTouchEnd']?.(event);
      // setIsOwnPointerActive(false);
      onChange(false);
    };
  }

  if (state.meta.isGroupParent) {
    props = {
      value: id,
      children: createElement(component, props),
    };
    component = groupContext.Provider;
  }

  if (component === baseComponent) {
    switch (getComponentType(component)) {
      case 'forwardRef': {
        const ref = props['ref'];
        delete props['ref'];
        return (component as any).render(props, ref);
      }
      case 'function':
        return (component as any)(props);
      case 'string':
      case 'object':
      case 'class':
      case 'unknown':
        return createElement(component, props);
    }
  } else {
    return createElement(component, props);
  }

  // Object.assign(props, styledProps);

  // return renderTwinComponent(component, meta, props, ref);
}

// export function twinComponent(
//   component: ComponentType<any>,
//   configs: ComponentConfig[],
//   props: Record<string, any> | null,
//   ref: any,
// ) {
//   const { styledProps, componentHandlerRef } = useComponentState(configs, props);

//   props = Object.assign({ ref }, props);
//   for (const x of componentHandlerRef.current.propStates) {
//     if (x.target !== x.source) {
//       delete props[x.source];
//     }
//   }
//   Object.assign(props, styledProps);

//   return renderTwinComponent(component, componentHandlerRef.current, props);
// }
