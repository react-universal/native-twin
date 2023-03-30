import { ComponentType, createElement, ForwardedRef, ReactNode, useCallback } from 'react';
import { StyleSheet, Touchable } from 'react-native';
import { useComponentStyleSheets, StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';

// import { useRenderCounter } from './useRenderCounter';

function useBuildStyledComponent<T, P extends keyof T>(
  props: StyledProps<T>,
  Component: ComponentType<T>,
  ref: ForwardedRef<unknown>,
  styleClassProps?: P[],
) {
  // useRenderCounter();
  const { className, classPropsTuple } = useBuildStyleProps(props, styleClassProps);

  const { component$, componentID } = useComponentStyleSheets({
    className,
    classPropsTuple,
    inlineStyles: props.style,
    isFirstChild: props.isFirstChild,
    isLastChild: props.isLastChild,
    nthChild: props.nthChild,
    parentID: props.parentID,
  });

  const { componentInteractionHandlers, focusHandlers } = useComponentInteractions({
    props: props as Touchable,
    hasGroupInteractions: component$?.hasPointerInteractions ?? false,
    hasPointerInteractions: component$?.hasPointerInteractions ?? false,
    isGroupParent: component$?.isGroupParent ?? false,
    id: component$?.id,
  });

  // @ts-expect-error
  const componentChilds = useChildren(props.children, componentID, () => []);

  const composeStyleProps = useCallback(() => {
    return StyleSheet.flatten([
      component$?.baseStyles.reduce((prev, current) => {
        Object.assign(prev, current[1]);
        return prev;
      }, {}),
      props.style,
    ]);
  }, [component$?.baseStyles, props.style]);

  const styles = composeStyleProps();

  // @ts-expect-error
  const transformedComponent = createElement(Component, {
    ...props,
    ...componentInteractionHandlers,
    ...focusHandlers,
    // ...component$.getStyleProps,
    style: styles,
    children: componentChilds,
    ref,
  } as unknown as T);
  const returnValue: ReactNode = transformedComponent;

  return returnValue;
}

export { useBuildStyledComponent };
