import { Gesture } from 'react-native-gesture-handler';
import { useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';
import { useComponentState } from './useComponentState';

export function useInteraction(hasInteractions: boolean) {
  const { onHover, onBlur, state } = useComponentState();
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder() {
        return true;
      },
      onPanResponderGrant() {
        onHover();
      },
      onPanResponderRelease() {
        onBlur();
      },
    }),
  ).current;
  const gestures = useMemo(() => {
    return {
      singleTap: Gesture.Tap().onStart((event) => {
        console.log('SINGLE_TAP', event);
      }),
    };
  }, []);
  if (!hasInteractions) return { panHandlers: {}, componentState: state, gestures };
  return {
    ...panResponder,
    componentState: state,
    gestures,
  };
}
