import {
  ClassAttributes,
  ComponentType,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useRef,
  Component as ReactComponent,
  ReactNode,
  LegacyRef,
} from 'react';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties, TInternalStyledComponentProps } from '../types/styles.types';

type ForwardRef<T, P> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
type InferRef<T> = T extends RefAttributes<infer R> | ClassAttributes<infer R> ? R : unknown;

function styled<T>(Component: ComponentType<T>) {
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
    const {
      styles,
      componentState,
      componentChilds,
      componentInteractionHandlers,
      component,
    } = useStyledComponent(props);

    return (
      // @ts-expect-error
      <WithTailwind
        {...props}
        {...componentState}
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

export { styled };
