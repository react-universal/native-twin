import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ComponentType, forwardRef, ComponentProps } from 'react';
import type { IExtraProperties } from './styled.types';
import useStyled from './useStyled';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T>(({ className = '', ...restProps }: any, ref) => {
    const { id, styles, gestures, hasInteractions, panHandlers } = useStyled(className);
    if (hasInteractions) {
      return (
        <GestureDetector gesture={Gesture.Exclusive(gestures.singleTap)}>
          <Component key={id} {...restProps} {...panHandlers} ref={ref} style={styles} />
        </GestureDetector>
      );
    }
    return <Component key={id} {...restProps} {...panHandlers} ref={ref} style={styles} />;
  });
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  }
  return Styled as ComponentType<ComponentProps<typeof Component> & IExtraProperties>;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
