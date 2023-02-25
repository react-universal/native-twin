import {
  ClassAttributes,
  ComponentType,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import { TailwindContextProvider } from '../context/TailwindContext';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties } from '../types/styles.types';

type ForwardRef<T, P> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
type InferRef<T> = T extends RefAttributes<infer R> | ClassAttributes<infer R> ? R : unknown;

function styled<T>(Component: ComponentType<T>) {
  function Styled(props: IExtraProperties<T>, ref: ForwardedRef<unknown>) {
    const {
      styles,
      componentState,
      isGroupParent,
      componentChilds,
      componentInteractionHandlers,
    } = useStyledComponent(props);
    const styledElement = (
      <Component
        {...props}
        {...componentState}
        {...componentInteractionHandlers}
        style={[styles, props.style]}
        ref={ref}
      >
        {componentChilds}
      </Component>
    );
    if (isGroupParent) {
      return (
        <TailwindContextProvider
          parentState={{
            'group-hover': componentState.groupHoverInteraction.state,
            active: componentState.activeInteraction.state,
            dark: false,
            focus: componentState.focusInteraction.state,
            hover: componentState.hoverInteraction.state,
          }}
        >
          {styledElement}
        </TailwindContextProvider>
      );
    }
    return styledElement;
  }

  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  return forwardRef(Styled) as ForwardRef<InferRef<T>, IExtraProperties<T>>;
}

export { styled };
