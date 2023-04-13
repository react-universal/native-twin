import { ComponentType, ForwardedRef, forwardRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { StyledProps } from '@universal-labs/stylesheets';
import { useBuildStyledComponent } from '../hooks/useBuildStyledComponent';
import type { ForwardRef, InferRef } from '../types/styled.types';

export function styled<T, P extends keyof T>(
  Component: ComponentType<T>,
  styleClassProps?: P[],
): ForwardRef<
  InferRef<T>,
  { [key in keyof T]: key extends P ? T[key] | string : T[key] } & {
    className?: string;
    tw?: string;
  }
> {
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
    const styledProps = useMemo(() => {
      if (styleClassProps && styleClassProps?.length > 0) {
        return styleClassProps.reduce((prev, current) => {
          if (current in restProps) {
            const originalProp = restProps[current];
            if (typeof originalProp === 'string') {
              prev[current] = originalProp;
            }
          }
          return prev;
        }, {} as Record<P, string>);
      }
      return {};
    }, [restProps]);
    const {
      componentChilds,
      componentInteractionHandlers,
      focusHandlers,
      composedStyles,
      composedStyledProps,
    } = useBuildStyledComponent(
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
        ...styledProps,
      },
      // @ts-expect-error
      styleClassProps,
    );
    return (
      <Component
        style={StyleSheet.flatten([style, composedStyles])}
        ref={ref}
        {...componentInteractionHandlers}
        {...focusHandlers}
        {...restProps}
        {...composedStyledProps}
      >
        {componentChilds}
      </Component>
    );
  }
  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;

  return forwardRef(Styled) as any;
}
