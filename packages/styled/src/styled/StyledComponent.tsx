import { ComponentType, ForwardedRef, forwardRef } from 'react';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import { useStyledComponent } from '../hooks';
import type { ForwardRef, InferRef, StyledOptions, StyledProps } from '../types/styled.types';

export function styled<T, P extends keyof T>(
  Component: ComponentType<T>,
  styledOptions: StyledOptions<T, P> = {},
) {
  function Styled(
    props: StyledProps<IExtraProperties<T & TInternalStyledComponentProps>>,
    ref: ForwardedRef<any>,
  ) {
    const { styles, componentChilds, componentInteractionHandlers, component } =
      useStyledComponent(props, styledOptions);
    return (
      <Component
        {...props}
        {...componentInteractionHandlers}
        style={[styles, props.style]}
        key={component.id}
        ref={ref}
      >
        {componentChilds}
      </Component>
    );
  }

  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  return forwardRef(Styled) as ForwardRef<
    InferRef<T>,
    StyledProps<{ [key in keyof T]: key extends P ? T[key] | string : T[key] }>
  >;
}
