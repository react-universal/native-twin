import type { ComponentType, ComponentProps } from 'react';
import type { IExtraProperties } from './styled.types';
import useStyled from './useStyled';

function styled<T extends ComponentType>(Component: T) {
  const Styled = ({ className = '', style = {}, ...restProps }: any) => {
    const { styles, panHandlers } = useStyled({ inlineStyles: style, className });
    // if (hasInteractions) {
    //   return (
    //     <LongPressGestureHandler onHandlerStateChange={onHandlerStateChange}>
    //       <Component {...restProps} style={styles} />
    //     </LongPressGestureHandler>
    //   );
    // }
    return <Component {...restProps} {...panHandlers} style={styles} />;
  };
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || 'NoName'}`;
  }
  return Styled as ComponentType<ComponentProps<typeof Component> & IExtraProperties>;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
