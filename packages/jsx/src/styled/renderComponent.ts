// @ts-noCheck
import { type ComponentType, createElement, useState } from 'react';
import {
  InteractionPropsState,
  TwinContext,
  useTwinContext,
  useTwinProvider,
} from '../context/twin.context';
import { JSXStyledProps } from '../jsx/jsx-custom-props';
import { getComponentType } from '../utils/react.utils';

/**
 * Render the baseComponent
 * @param baseComponent
 * @param state
 * @param props
 * @param variables
 * @returns
 */
export function renderTwinComponent(
  baseComponent: ComponentType<any>,
  meta: JSXStyledProps[1]['metadata'],
  props: Record<string, any>,
  ref: Record<string, any>,
) {
  let component = baseComponent;
  const [_state, setState] = useTwinContext();
  const providerValues = useTwinProvider();
  const [_internalState, setInternalState] = useState({
    isPointerActive: false,
    isGroupActive: meta.isGroupParent,
  });

  if (meta.hasPointerEvents || meta.hasGroupEvents) {
    props['onTouchStart'] = (event: unknown) => {
      ref?.['onTouchStart']?.(event);
      setInternalState((p) => ({
        ...p,
        isPointerActive: true,
      }));
      setState?.({
        isPointerActive: true,
        isGroupActive: meta.isGroupParent,
      });
    };
    props['onTouchEnd'] = (event: unknown) => {
      ref?.['onTouchEnd']?.(event);
      setInternalState((p) => ({
        ...p,
        isPointerActive: false,
      }));
      // setState?.({
      //   isPointerActive: false,
      //   isGroupActive: false,
      // });
    };
  }

  if (meta.isGroupParent) {
    props = {
      value: providerValues,
      children: createElement(component, props),
    };
    component = TwinContext.Provider;
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
}

export function attachInteractionProps(
  meta: JSXStyledProps[1]['metadata'],
  setState: ((values: Partial<InteractionPropsState>) => void) | null,
  props: Record<string, any>,
) {
  if (meta.hasPointerEvents || meta.hasGroupEvents) {
    props['onTouchStart'] = (event: unknown) => {
      // state.runtimeProps?.['onTouchStart']?.(event);
      setState?.({
        isPointerActive: true,
      });
    };
    props['onTouchEnd'] = (event: unknown) => {
      setState?.({
        isPointerActive: false,
      });
    };
  }
  // if (state.interaction.hover) {
  //   props['onHoverIn'] = (event: unknown) => {
  //     state.interaction.hover ??= observable(false);
  //     state.refs.props?.['onHoverIn']?.(event);
  //     state.interaction.hover!.set(true);
  //   };
  //   props['onHoverOut'] = (event: unknown) => {
  //     state.interaction.active ??= observable(false);
  //     state.interaction.hover ??= observable(false);
  //     state.refs.props?.['onHoverOut']?.(event);
  //     state.interaction.hover.set(false);
  //     state.interaction.active.set(false);
  //   };
  // }

  // if (state.interaction.focus) {
  //   props['onFocus'] = (event: unknown) => {
  //     state.interaction.active ??= observable(false);
  //     state.interaction.focus ??= observable(false);
  //     state.refs.props?.['onFocus']?.(event);
  //     state.interaction.focus.set(true);
  //   };
  //   props['onBlur'] = (event: unknown) => {
  //     state.interaction.active ??= observable(false);
  //     state.interaction.focus ??= observable(false);
  //     state.refs.props?.['onBlur']?.(event);
  //     state.interaction.focus.set(false);
  //   };
  // }

  // if (state.propsMeta.hasPointerEvents || state.propsMeta.hasGroupEvents) {
  //   props['onPress'] = (event: unknown) => {
  //     state.runtimeProps?.['onPress']?.(event);
  //   };
  // }
}
