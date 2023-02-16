import { useMemo } from 'react';
import { PanResponder } from 'react-native';
import { IComponentInteractions, useComponentState } from '@react-universal/core';

interface IComponentInteractionsData {
  interactionStyles: IComponentInteractions[];
}
const useComponentInteractions = (
  { interactionStyles }: IComponentInteractionsData,
  componentProps: any,
) => {
  const { state: componentState, onBlur, onHover } = useComponentState(componentProps);
  const hasInteractions = useMemo(() => interactionStyles.length > 0, [interactionStyles]);
  const panResponder = useMemo(() => {
    if (!hasInteractions) {
      return { panHandlers: {} };
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
    componentState,
    hasInteractions,
    panHandlers: panResponder.panHandlers,
    interactions: {
      onBlur,
      onHover,
    },
  };
};

export { useComponentInteractions };
