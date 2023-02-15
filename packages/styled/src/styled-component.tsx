import { ComponentType, ComponentProps, forwardRef, useRef } from 'react';
import { findNodeHandle } from 'react-native';
import { useStyled } from './hooks/useStyled';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T, IExtraProperties>(
    ({ className, tw, style, ...restProps }, ref) => {
      const innerRef = useRef(ref);
      const { styles, panHandlers } = useStyled(
        {
          inlineStyles: style,
          className: className ?? tw,
        },
        restProps,
      );
      console.log('INNER: ', innerRef);
      return (
        // @ts-expect-error
        <Component {...restProps} {...panHandlers} ref={innerRef} style={styles} />
      );
    },
  );
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || 'NoName'}`;
  }
  console.log('STYLED_OUT: ', Styled);
  return Styled as ComponentType<ComponentProps<typeof Component> & IExtraProperties>;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
