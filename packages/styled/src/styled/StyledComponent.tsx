import { ComponentType, ForwardedRef, forwardRef } from 'react';
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
  function Styled(props: any, ref: ForwardedRef<any>) {
    const { componentChilds, componentInteractionHandlers, focusHandlers, composedStyles } =
      useBuildStyledComponent(props, styleClassProps);
    return (
      <Component
        {...props}
        {...componentInteractionHandlers}
        {...focusHandlers}
        style={[props?.style, composedStyles]}
        ref={ref}
      >
        {componentChilds}
      </Component>
    );
  }
  Styled.displayName = `StyledTW.(${Component.displayName || Component.name || 'NoName'})`;

  return forwardRef(Styled) as any;
}
