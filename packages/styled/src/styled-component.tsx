import { ComponentType, ComponentProps, forwardRef } from 'react';
import { GroupContextProvider } from './context/GroupContext';
import { useStyledComponent } from './hooks';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T, ComponentProps<T> & IExtraProperties>(
    ({ className, tw, style, ...restProps }, ref) => {
      const { styles, panHandlers, componentState, isGroupParent } = useStyledComponent(
        {
          inlineStyles: style,
          className: className ?? tw,
        },
        restProps,
        Component,
      );
      console.log('RENDER: ');
      if (isGroupParent) {
        return (
          <GroupContextProvider isHover={componentState['group-hover']}>
            {/* @ts-expect-error */}
            <Component {...restProps} {...panHandlers} ref={ref} style={styles} />
          </GroupContextProvider>
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
export { mergeTWClasses } from './utils/mergeClasses';
