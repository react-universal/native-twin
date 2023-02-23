import { ComponentType, ComponentProps, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { TailwindContextProvider } from '../context/TailwindContext';
import { useStyledComponent } from '../hooks';
import type { IExtraProperties } from '../types/styles.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = ({
    className,
    tw,
    // @ts-expect-error
    style,
    children,
    ...restProps
  }: ComponentProps<T> & IExtraProperties) => {
    const renderNo = ++useRef(0).current;
    console.log('RENDER_NO: ', renderNo);
    const { styles, panHandlers, componentState, isGroupParent, componentChilds } =
      useStyledComponent(className ?? tw ?? '', children);
    if (isGroupParent) {
      return (
        <TailwindContextProvider parentState={componentState}>
          {/* @ts-expect-error */}
          <Component {...restProps} {...panHandlers} style={styles}>
            {componentChilds}
          </Component>
        </TailwindContextProvider>
      );
    }
    return (
      //@ts-expect-error
      <Component {...restProps} {...panHandlers} style={StyleSheet.compose([styles, style])}>
        {componentChilds}
      </Component>
    );
  };
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || 'NoName'}`;
  }
  return Styled;
}

export { styled };
