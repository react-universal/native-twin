import {
  ClassAttributes,
  ComponentType,
  createElement,
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
} from 'react';
import { TailwindContextProvider } from '../context/TailwindContext';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties } from '../types/styles.types';

type ForwardRef<T, P> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
type InferRef<T> = T extends RefAttributes<infer R> | ClassAttributes<infer R> ? R : unknown;

function styled<T>(Component: ComponentType<T>): ForwardRef<InferRef<T>, IExtraProperties<T>> {
  function Styled(props: IExtraProperties<T>, ref: ForwardedRef<unknown>) {
    const {
      styles,
      componentState,
      isGroupParent,
      componentChilds,
      componentInteractionHandlers,
    } = useStyledComponent(props);
    const element: ReactNode = createElement(
      // @ts-expect-error
      Component,
      {
        ...props,
        ...componentInteractionHandlers,
        children: componentChilds,
        style: [styles, props.style],
        ref,
      },
    ) as unknown as ReactNode;
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
          {element}
        </TailwindContextProvider>
      );
    }
    return element;
  }

  Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  // @ts-expect-error
  return forwardRef(Styled) as ForwardRef<InferRef<T>, IExtraProperties<T>>;
}

export { styled };
