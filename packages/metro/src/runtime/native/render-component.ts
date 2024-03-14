import { type ComponentType, createElement } from 'react';
import { Pressable, View } from 'react-native';
import { observable } from '../observable';
import { getComponentType } from '../utils/getComponentType';
import { variableContext, containerContext } from './globals';
import type { ComponentState } from './styled.types';

// const animatedCache = new Map<ComponentType<any> | string, ComponentType<any>>();

export const UpgradeState = {
  NONE: 0,
  SHOULD_UPGRADE: 1,
  UPGRADED: 2,
  WARNED: 3,
};

/**
 * Render the baseComponent
 * @param baseComponent
 * @param state
 * @param props
 * @param variables
 * @param containers
 * @returns
 */
export function renderComponent(
  baseComponent: ComponentType<any>,
  state: ComponentState,
  props: Record<string, any>,
  variables: Record<string, any>,
  containers: Record<string, any>,
) {
  let component = baseComponent;
  // const shouldWarn = state.upgrades.canWarn;
  // const isContainer = state.upgrades.containers;

  if (state.interaction.active) {
    state.interaction.active ??= observable(false);
    props.onPressIn = (event: unknown) => {
      state.refs.props?.onPressIn?.(event);
      state.interaction.active!.set(true);
    };
    props.onPressOut = (event: unknown) => {
      state.refs.props?.onPressOut?.(event);
      state.interaction.active!.set(false);
    };
  }
  if (state.interaction.hover) {
    state.interaction.hover ??= observable(false);
    props.onHoverIn = (event: unknown) => {
      state.refs.props?.onHoverIn?.(event);
      state.interaction.hover!.set(true);
    };
    props.onHoverOut = (event: unknown) => {
      state.refs.props?.onHoverOut?.(event);
      state.interaction.hover!.set(false);
    };
  }

  if (state.interaction.focus) {
    state.interaction.focus ??= observable(false);
    props.onFocus = (event: unknown) => {
      state.refs.props?.onFocus?.(event);
      state.interaction.focus!.set(true);
    };
    props.onBlur = (event: unknown) => {
      state.refs.props?.onBlur?.(event);
      state.interaction.focus!.set(false);
    };
  }
  /**
   * Some React Native components (e.g Text) will not apply state event handlers
   * if `onPress` is not defined.
   */
  if (state.interaction.active || state.interaction.hover || state.interaction.focus) {
    props.onPress = (event: unknown) => {
      state.refs.props?.onPress?.(event);
    };
  }

  // if (state.interaction.layout || isContainer) {
  //   state.interaction.layout ??= observable([0, 0]);
  //   props.onLayout = (event: LayoutChangeEvent) => {
  //     state.refs.props?.onLayout?.(event);
  //     const layout = event.nativeEvent.layout;
  //     const prevLayout = state.interaction.layout!.get();
  //     if (layout.width !== prevLayout[0] || layout.height !== prevLayout[0]) {
  //       state.interaction.layout!.set([layout.width, layout.height]);
  //     }
  //   };
  // }

  // TODO: We can probably remove this in favor of using `new Pressability()`
  if (
    component === View &&
    (state.interaction.hover || state.interaction.active || state.interaction.focus)
  ) {
    component = Pressable;
    props.cssInterop = false;
    if (state.upgrades.pressable === UpgradeState.SHOULD_UPGRADE) {
      printUpgradeWarning(
        `Converting View to Pressable should only happen during the initial render otherwise it will remount the View.\n\nTo prevent this warning avoid adding styles which use pseudo-classes (e.g :hover, :active, :focus) to View components after the initial render, or change the View to a Pressable`,
        state.refs.props,
      );
    }
    state.upgrades.pressable = UpgradeState.UPGRADED;
  }

  if (state.upgrades.variables) {
    if (state.upgrades.variables === UpgradeState.SHOULD_UPGRADE) {
      printUpgradeWarning(
        `Making a component inheritable should only happen during the initial render otherwise it will remount the component.\n\nTo prevent this warning avoid dynamically adding CSS variables or 'container' styles to components after the initial render, or ensure it has a default style that sets either a CSS variable, "container: none" or "container-type: none"`,
        state.refs.props,
      );
    }
    state.upgrades.variables = UpgradeState.UPGRADED;

    props = {
      value: variables,
      children: createElement(component, props),
    };
    component = variableContext.Provider;
  }

  if (state.upgrades.containers) {
    if (state.upgrades.containers === UpgradeState.SHOULD_UPGRADE) {
      printUpgradeWarning(
        `Making a component inheritable should only happen during the initial render otherwise it will remount the component.\n\nTo prevent this warning avoid dynamically adding CSS variables or 'container' styles to components after the initial render, or ensure it has a default style that sets either a CSS variable, "container: none" or "container-type: none"`,
        state.refs.props,
      );
    }
    state.upgrades.containers = UpgradeState.UPGRADED;

    props = {
      value: containers,
      children: createElement(component, props),
    };
    component = containerContext.Provider;
  }

  // After the initial render, the user shouldn't upgrade the component. Avoid warning in production
  state.upgrades.canWarn = process.env.NODE_ENV !== 'production';

  /**
   * A hack to improve performance by avoiding adding duplicate components to the render tree
   *
   * The native interop already substitutes the component with a ForwardRef, so if we render a <View /> it actually renders
   *
   * <ForwardRef>
   *   <ForwardRef>
   *     <View>
   *
   * Instead of rendering the extra ForwardRef, we can compose them together (by directly calling the render function) into the same component, so it renders
   * <ForwardRef>
   *   <View>
   *
   * This improves performance by a meaningful amount.
   *
   * This isn't properly implemented. What we should be doing in the cssInterop function is generating a new component
   * that matches the type of the original component (e.g Function components should just be function components, nof ForwardRefs)
   * and passing a flag down if the component is composable.
   */
  if (component === baseComponent) {
    switch (getComponentType(component)) {
      case 'forwardRef': {
        const ref = props.ref;
        delete props.ref;
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
    /*
     * Class/Object/String components are not composable, so they are added to the tree as normal
     */
    return createElement(component, props);
  }
}

function printUpgradeWarning(
  warning: string,
  originalProps: Record<string, any> | null | undefined,
) {
  console.warn(
    `CssInterop upgrade warning.\n\n${warning}.\n\nIf add/removing sibling components cause this warning, add a unique "key" prop so React can correctly track this component.`,
  );
  try {
    // Not all props can be stringified
    console.warn(
      `The previous warning was caused by a component with these props: ${JSON.stringify(
        originalProps,
      )}`,
    );
  } catch {
    if (originalProps) {
      console.warn(
        `The previous warning was caused by a component with these props: ${JSON.stringify(
          Object.keys(originalProps),
        )}. Some props could not be stringified, so only the keys are shown.`,
      );
    }
  }
}
