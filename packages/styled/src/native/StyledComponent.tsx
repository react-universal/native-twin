import {
  ComponentType,
  createElement,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
} from 'react';
import type { PropsFrom, StyledProps } from '../types/styled.types';
import { useBuildStyledComponent } from './hooks/useStyledComponent';

export function styled<T>(
  Component: ComponentType<T>,
): ForwardRefExoticComponent<PropsFrom<typeof Component> & StyledProps<{}>> {
  function Styled(
    {
      isFirstChild,
      isLastChild,
      nthChild,
      className,
      groupID,
      parentID,
      style,
      tw,
      children,
      ...restProps
    }: StyledProps<any>,
    ref: ForwardedRef<any>,
  ) {
    const {
      componentInteractionHandlers,
      focusHandlers,
      componentStyles,
      componentChilds,
      currentGroupID,
    } = useBuildStyledComponent({
      isFirstChild,
      isLastChild,
      nthChild,
      className,
      groupID,
      parentID,
      style,
      tw,
      children,
      ...restProps,
    });
    // @ts-ignore
    return createElement(Component, {
      style: componentStyles,
      ref,
      children: componentChilds,
      parentID,
      groupID: currentGroupID,
      ...focusHandlers,
      ...componentInteractionHandlers,
      ...restProps,
    });
  }
  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;

  return forwardRef(Styled) as any;
}
