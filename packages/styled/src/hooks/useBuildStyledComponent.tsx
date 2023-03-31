import { ComponentType, createElement, ForwardedRef, ReactNode } from 'react';
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
    composedStyles,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
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

  // @ts-expect-error
  const transformedComponent = createElement(Component, {
    ...props,
    ...componentInteractionHandlers,
    ...focusHandlers,
    // ...component$.getStyleProps,
    style: composedStyles,
    children: componentChilds,
    ref,
  } as unknown as T);
  const returnValue: ReactNode = transformedComponent;

  return returnValue;
}

export { useBuildStyledComponent };
