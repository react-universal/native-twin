import { ComponentType, ComponentProps, forwardRef } from 'react';
import { InteractionsContextProvider } from './context/InteractionsContext';
import { useStyledComponent } from './hooks/useStyled';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T, ComponentProps<T> & IExtraProperties>(
    ({ className, tw, style, ...restProps }, ref) => {
      const { styles, panHandlers, componentState } = useStyledComponent(
        {
          inlineStyles: style,
          className: className ?? tw,
        },
        restProps,
      );
      return (
        <InteractionsContextProvider isHover={componentState.hover}>
          {/* @ts-expect-error */}
          <Component {...restProps} {...panHandlers} ref={ref} style={styles} />
        </InteractionsContextProvider>
      );
    },
  );
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || 'NoName'}`;
  }
  return Styled;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
