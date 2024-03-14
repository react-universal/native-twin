import { type ComponentType, createElement } from 'react';
import { groupContext } from '../context';
import { StyledComponentHandler } from '../store/component.store';
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
  state: StyledComponentHandler,
  props: Record<string, any>,
) {
  let component = baseComponent;

  attachInteractionProps(state, props);

  if (state.propsMeta.isGroupParent) {
    props = {
      value: state.getChildStyles,
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
}

function attachInteractionProps(state: StyledComponentHandler, props: Record<string, any>) {
  if (state.propsMeta.hasPointerEvents || state.propsMeta.hasGroupEvents) {
    props['onTouchStart'] = (event: unknown) => {
      state.runtimeProps?.['onTouchStart']?.(event);
      state.setInteractions({
        ...state.localInteractionsState,
        hover: true,
      });
    };
    props['onTouchEnd'] = (event: unknown) => {
      state.runtimeProps?.['onTouchEnd']?.(event);
      state.setInteractions({
        ...state.localInteractionsState,
        hover: false,
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
