import { useMemo } from 'react';
import { PanResponder } from 'react-native';
import {
  useTailwind,
  useComponentState,
  type IRegisterComponentArgs,
} from '@react-universal/core';

function useStyled(data: Omit<IRegisterComponentArgs, 'id'>, componentProps: any) {
  const {
    id,
    styles: classNameStyles,
    hasInteractions,
    interactionStyles,
  } = useTailwind({
    inlineStyles: data.inlineStyles,
    className: data.className,
  });
  const { state: componentState, onBlur, onHover } = useComponentState(componentProps);
  const styles = useMemo(() => {
    if (!hasInteractions) return [classNameStyles];
    if (componentState.hover) {
      return [
        classNameStyles,
        interactionStyles.find(([name]) => name === 'hover')?.[1].styles,
      ];
    }
    return [classNameStyles];
  }, [classNameStyles, hasInteractions, interactionStyles, componentState.hover]);

  const panResponder = useMemo(() => {
    if (!hasInteractions) {
      return PanResponder.create({});
    }
    return PanResponder.create({
      onStartShouldSetPanResponder(event, gestureState) {
        return hasInteractions && gestureState.numberActiveTouches === 1;
      },
      onPanResponderGrant(event, gestureState) {
        if (gestureState.numberActiveTouches === 1) {
          onHover();
        }
      },
      onPanResponderEnd() {
        onBlur();
      },
    });
  }, [hasInteractions, onBlur, onHover]);

  return {
    styles,
    id,
    panHandlers: panResponder.panHandlers,
    hasInteractions,
    componentState,
  };
}

export { useStyled };
