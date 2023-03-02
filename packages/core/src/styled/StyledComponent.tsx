/* @refresh reset */
import {
  ClassAttributes,
  ComponentType,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useRef,
} from 'react';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties } from '../types/styles.types';

type ForwardRef<T, P> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
type InferRef<T> = T extends RefAttributes<infer R> | ClassAttributes<infer R> ? R : unknown;

function styled<T>(Component: ComponentType<T>) {
  function Styled(props: IExtraProperties<T>, ref: ForwardedRef<unknown>) {
    const {
      styles,
      componentState,
      componentChilds,
      componentInteractionHandlers,
      component,
    } = useStyledComponent(props);
    const innerRef = useRef(ref);

    const styledElement = (
      <Component
        {...props}
        {...componentState}
        {...componentInteractionHandlers}
        style={[styles, props.style]}
        key={component.id}
        forwardedRef={innerRef}
        ref={innerRef}
      >
        {componentChilds}
      </Component>
    );
    return styledElement;
  }

  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  return forwardRef(Styled) as ForwardRef<InferRef<T>, IExtraProperties<T>>;
}

export { styled };
