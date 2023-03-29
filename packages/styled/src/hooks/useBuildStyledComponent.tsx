import { ComponentType, createElement, ForwardedRef, ReactNode } from 'react';
import type { Touchable } from 'react-native';
import { useComponentStyleSheets, StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyleProps } from './useBuildStyleProps';
import { useChildren } from './useChildren';
import { useComponentInteractions } from './useComponentInteractions';

function useBuildStyledComponent<T, P extends keyof T>(
  props: StyledProps<T>,
  Component: ComponentType<T>,
  ref: ForwardedRef<unknown>,
  styleClassProps?: P[],
) {
  const classProps = useBuildStyleProps(props, styleClassProps);

  const { component } = useComponentStyleSheets({
    classProps,
    inlineStyles: props.style,
    isFirstChild: props.isFirstChild,
    isLastChild: props.isLastChild,
    nthChild: props.nthChild,
    parentID: props.parentID,
  });

  const { componentInteractionHandlers } = useComponentInteractions({
    props: props as Touchable,
    componentID: component.id,
    hasGroupInteractions: component.hasPointerInteractions,
    hasPointerInteractions: component.hasPointerInteractions,
    isGroupParent: component.isGroupParent,
  });

  const componentChilds = useChildren(
    props.children,
    component?.id,
    component?.getChildStyles,
  );

  // @ts-expect-error
  const transformedComponent = createElement(Component, {
    ...props,
    ...componentInteractionHandlers,
    ...component.getStyleProps,
    children: componentChilds,
    ref,
  } as unknown as T);
  const returnValue: ReactNode = transformedComponent;

  return returnValue;
}

export { useBuildStyledComponent };
