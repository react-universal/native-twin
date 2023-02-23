import { useCallback, useMemo } from 'react';
import { PanResponder } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import type { IComponentInteractions } from '../types/store.types';

interface IComponentInteractionsData {
  interactionStyles: IComponentInteractions[];
}
const useComponentInteractions = ({ interactionStyles }: IComponentInteractionsData) => {
  const isHover = useSharedValue(false);
  const onHover = useCallback(() => {
    console.log('ON_HOVER');
    isHover.value = true;
  }, [isHover]);
  const onBlur = useCallback(() => {
    isHover.value = false;
  }, [isHover]);

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
    componentState: {
      hover: isHover.value,
      active: false,
      focus: false,
      'group-hover': false,
      dark: false,
    },
    hasInteractions,
    panHandlers: panResponder.panHandlers,
    interactions: {
      onBlur,
      onHover,
    },
  };
};

export { useComponentInteractions };
