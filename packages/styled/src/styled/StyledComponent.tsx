import {
  ComponentType,
  ForwardedRef,
  forwardRef,
  useRef,
  Component as ReactComponent,
  ReactNode,
  LegacyRef,
} from 'react';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import type { StyleProp } from 'react-native/types';
import { useStyledComponent } from '../hooks';
import type { ForwardRef, InferRef, StyledOptions, StyledProps } from '../types/styled.types';

export function styled<T, P extends keyof T, C extends keyof T>(
  Component: ComponentType<T>,
  options?: StyledOptions<T, P, C>,
): ForwardRef<
  InferRef<T>,
  StyledProps<{ [key in keyof T]: key extends P ? T[key] | string : T[key] }>
>;

export function styled<
  T extends { style?: StyleProp<any>; children: ReactNode | undefined },
  P extends keyof T,
  C extends keyof T,
>(Component: ComponentType<T>, baseClassNameOrOptions?: string | StyledOptions<T, P, C>) {
  class WithTailwind extends ReactComponent<
    IExtraProperties<T & TInternalStyledComponentProps> & {
      forwardedRef: ForwardedRef<unknown>;
    }
  > {
    render(): ReactNode {
      return (
        <Component {...this.props} ref={this.props.forwardedRef}>
          {this.props.children}
        </Component>
      );
    }
  }
  function Styled(
    props: IExtraProperties<T & TInternalStyledComponentProps>,
    ref: ForwardedRef<unknown>,
  ) {
    const innerRef = useRef(ref);
    const { styles, componentChilds, componentInteractionHandlers, component } =
      useStyledComponent(props, baseClassNameOrOptions);

    return (
      // @ts-expect-error
      <WithTailwind
        {...props}
        {...componentInteractionHandlers}
        style={[styles, props.style]}
        key={component.id}
        forwardedRef={ref as LegacyRef<WithTailwind> | undefined}
        ref={innerRef as LegacyRef<WithTailwind> | undefined}
      >
        {componentChilds}
      </WithTailwind>
    );
  }

  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  return forwardRef(Styled) as ForwardRef<InferRef<T>, IExtraProperties<T>>;
}
