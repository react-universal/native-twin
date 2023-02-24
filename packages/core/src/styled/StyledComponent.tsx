import { GestureDetector } from 'react-native-gesture-handler';
import { ComponentType, forwardRef, FunctionComponent } from 'react';
import { TailwindContextProvider } from '../context/TailwindContext';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties } from '../types/styles.types';

function styled<Props extends object, Ref>(ComponentWithOutTailwind: ComponentType<Props>) {
  const Component = ComponentWithOutTailwind as FunctionComponent<Props>;
  const createAnimatedComponent = () => {
    const Styled = forwardRef<Ref, Props & IExtraProperties>(function StyledTW(props, ref) {
      const {
        styles,
        componentState,
        isGroupParent,
        componentChilds,
        gesture,
        hasGroupInteractions,
        hasInteractions,
      } = useStyledComponent(props);
      const node = (
        <GestureDetector gesture={gesture}>
          <Component {...props} {...componentState} style={[styles, props.style]} ref={ref}>
            {componentChilds}
          </Component>
        </GestureDetector>
      );
      if (isGroupParent) {
        return (
          <TailwindContextProvider parentState={componentState}>
            {node}
          </TailwindContextProvider>
        );
      }
      if (!hasGroupInteractions && !hasInteractions) {
        return node;
      }
      return <GestureDetector gesture={gesture}>{node}</GestureDetector>;
    });
    Styled.displayName = `StyledTW.${
      ComponentWithOutTailwind.displayName || ComponentWithOutTailwind.name || 'NoName'
    }`;
    return Styled;
  };
  return createAnimatedComponent;
}

export { styled };
