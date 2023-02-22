import { ComponentType, ComponentProps, forwardRef } from 'react';
import { TailwindContextProvider } from '../context/TailwindContext';
import type { IExtraProperties } from '../types/styles.types';
import { useStyledComponent } from './hooks';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T, ComponentProps<T> & IExtraProperties>(
    // @ts-expect-error
    ({ className, tw, style, ...restProps }, ref) => {
      const { styles, panHandlers, componentState, isGroupParent } = useStyledComponent(
        {
          inlineStyles: style,
          className: className ?? tw,
        },
        restProps,
        Component,
      );
      if (isGroupParent) {
        return (
          <TailwindContextProvider parentState={componentState}>
            {/* @ts-expect-error */}
            <Component {...restProps} {...panHandlers} ref={ref} style={styles} />
          </TailwindContextProvider>
        );
      }
      return (
        //@ts-expect-error
        <Component {...restProps} {...panHandlers} ref={ref} style={styles} />
      );
    },
  );
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || 'NoName'}`;
  }
  return Styled;
}

export { styled };
