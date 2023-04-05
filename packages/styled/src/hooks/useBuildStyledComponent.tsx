import { ComponentType, createElement, ForwardedRef, ReactNode } from 'react';
import type { Touchable } from 'react-native';
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

  const {
    componentID,
    styledProps,
    composedStyles,
    hasGroupInteractions,
    hasPointerInteractions,
    isGroupParent,
    currentComponentGroupID,
    getChildStyles,
  } = useComponentStyleSheets({
    groupID: props.groupID,
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

  const componentChilds = useChildren(
    props.children,
    componentID,
    getChildStyles,
    currentComponentGroupID === 'non-group'
      ? props.groupID ?? props.parentID ?? ''
      : currentComponentGroupID,
  );

  // @ts-expect-error
  const transformedComponent: ReactNode = createElement(Component, {
    ...props,
    ...componentInteractionHandlers,
    ...focusHandlers,
    ...styledProps,
    style: [props.style ?? {}, composedStyles],
    children: componentChilds,
    ref,
  } as unknown as T);

  return transformedComponent;
}

export { useBuildStyledComponent };
