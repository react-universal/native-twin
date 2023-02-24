import { GestureDetector } from 'react-native-gesture-handler';
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
      const { styles, componentState, isGroupParent, componentChilds, gesture } =
        useStyledComponent(props);
      if (isGroupParent) {
        return (
          <TailwindContextProvider parentState={componentState}>
            <GestureDetector gesture={gesture}>
              {/* @ts-expect-error */}
              <Component
                {...props}
                {...componentState}
                style={[styles, props.style]}
                ref={ref}
                onStartShouldSetPanResponder={() => false}
                focusable={false}
              >
                {componentChilds}
              </Component>
            </GestureDetector>
          </TailwindContextProvider>
        );
      }
      return (
        <GestureDetector gesture={gesture}>
          {/* @ts-expect-error */}
          <Component
            {...componentState}
            {...props}
            ref={ref}
            style={[styles, props.style]}
            onStartShouldSetPanResponder={() => false}
            focusable={false}
          >
            {componentChilds}
          </Component>
        </GestureDetector>
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
