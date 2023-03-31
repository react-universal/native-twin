import { ComponentType, createElement, ForwardedRef, ReactNode, useMemo } from 'react';
import type { Touchable } from 'react-native';
import { useComponentStyleSheets, StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';
import { useRenderCounter } from './useRenderCounter';

function useBuildStyledComponent<T, P extends keyof T>(
  props: StyledProps<T>,
  Component: ComponentType<T>,
  ref: ForwardedRef<unknown>,
  styleClassProps?: P[],
) {
  useRenderCounter();
  const { className, classPropsTuple } = useBuildStyleProps(props, styleClassProps);

  const {
    componentID,
    componentStyles,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    interactionStyles,
    component,
  } = useComponentStyleSheets({
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
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    id: componentID,
  });

  const componentChilds = useChildren(props.children, componentID);

  // const composeStyleProps = useCallback(() => {
  //   return StyleSheet.flatten([
  //     component$?.baseStyles.reduce((prev, current) => {
  //       Object.assign(prev, current[1]);
  //       return prev;
  //     }, {}),
  //     props.style,
  //   ]);
  // }, [component$?.baseStyles, props.style]);

  // const styles = composeStyleProps();

  const additionalStyles = useMemo(() => {
    const hoverStyles = interactionStyles.find(([selector]) => selector === 'hover');
    if (component.interactionsState.hover && hoverStyles) {
      // console.log('SHOULD_RETURN_HOVER');
      return hoverStyles[1].styles;
    }
    return {};
  }, [interactionStyles, component.interactionsState]);

  // @ts-expect-error
  const transformedComponent = createElement(Component, {
    ...props,
    ...componentInteractionHandlers,
    ...focusHandlers,
    // ...component$.getStyleProps,
    style: [...componentStyles.values(), additionalStyles],
    children: componentChilds,
    ref,
  } as unknown as T);
  const returnValue: ReactNode = transformedComponent;

  return returnValue;
}

export { useBuildStyledComponent };
