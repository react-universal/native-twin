import { ComponentType, ComponentProps, forwardRef, useRef, memo } from 'react';
import { TailwindContextProvider } from '../context/TailwindContext';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties } from '../types/styles.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T, ComponentProps<T> & IExtraProperties>(
    (
      {
        className,
        tw,
        // @ts-expect-error
        style,
        ...restProps
      },
      ref,
    ) => {
      let render = useRef(0);
      console.log('STYLED', ++render.current);
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
  return memo(Styled);
}

export { styled };
