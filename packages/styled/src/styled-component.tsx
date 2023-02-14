import { ComponentType, ComponentProps, forwardRef } from 'react';
import { useStyled } from './hooks/useStyled';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T, IExtraProperties>(
    ({ className, tw, style, ...restProps }, ref) => {
      const { styles, panHandlers } = useStyled(
        {
          inlineStyles: style,
          className: className ?? tw,
        },
        restProps,
      );
      return (
        // @ts-expect-error
        <Component {...restProps} {...panHandlers} ref={ref} style={styles} />
      );
    },
  );
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || 'NoName'}`;
  }
  return Styled as ComponentType<ComponentProps<typeof Component> & IExtraProperties>;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
