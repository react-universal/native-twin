import {
  ComponentType,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';
import { StyleSheet } from 'react-native';
import type { StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyledComponent } from '../hooks/useBuildStyledComponent';

export function styled<T>(
  Component: ComponentType<T>,
): ForwardRefExoticComponent<RefAttributes<T>> {
  function Styled(
    {
      isFirstChild,
      isLastChild,
      nthChild,
      children,
      className,
      groupID,
      parentID,
      style,
      tw,
      ...restProps
    }: StyledProps<any>,
    ref: ForwardedRef<any>,
  ) {
    const { componentChilds, componentInteractionHandlers, focusHandlers, componentStyles } =
      useBuildStyledComponent({
        isFirstChild,
        isLastChild,
        nthChild,
        children,
        className,
        groupID,
        parentID,
        style,
        tw,
        ...restProps,
      });
    return (
      <Component
        style={StyleSheet.flatten([componentStyles])}
        ref={ref}
        {...focusHandlers}
        {...restProps}
        {...componentInteractionHandlers}
      >
        {componentChilds}
      </Component>
    );
  }
  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;

  return forwardRef(Styled) as any;
}
