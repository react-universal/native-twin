import { LongPressGestureHandler } from 'react-native-gesture-handler';
import { ComponentType, forwardRef, FunctionComponent } from 'react';
import Animated from 'react-native-reanimated';
import { TailwindContextProvider } from '../context/TailwindContext';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties } from '../types/styles.types';

function styled<Props extends object, Ref>(ComponentWithOutTailwind: ComponentType<Props>) {
  const Component = Animated.createAnimatedComponent(
    ComponentWithOutTailwind as FunctionComponent<Props>,
  );
  const createAnimatedComponent = () => {
    const Styled = forwardRef<Ref, Props & IExtraProperties>(function StyledTW(props, ref) {
      const { styles, componentState, isGroupParent, componentChilds, interactionsHandler } =
        useStyledComponent(props);

      if (isGroupParent) {
        return (
          <TailwindContextProvider parentState={componentState}>
            <LongPressGestureHandler onGestureEvent={interactionsHandler} minDurationMs={5000}>
              {/* @ts-expect-error */}
              <Component
                {...props}
                {...componentState}
                style={[styles, props.style]}
                ref={ref}
              >
                {componentChilds}
              </Component>
            </LongPressGestureHandler>
          </TailwindContextProvider>
        );
      }
      return (
        <LongPressGestureHandler onGestureEvent={interactionsHandler} minDurationMs={5000}>
          {/* @ts-expect-error */}
          <Component {...componentState} {...props} ref={ref} style={[styles, props.style]}>
            {componentChilds}
          </Component>
        </LongPressGestureHandler>
      );
    });
    Styled.displayName = `StyledTW.${
      ComponentWithOutTailwind.displayName || ComponentWithOutTailwind.name || 'NoName'
    }`;
    return Styled;
  };
  return createAnimatedComponent;
}

export { styled };
