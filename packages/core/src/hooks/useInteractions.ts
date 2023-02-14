import { useAnimatedGestureHandler, runOnJS } from 'react-native-reanimated';
import { useComponentState } from './useComponentState';

export function useInteraction() {
  const { onHover, onBlur, state } = useComponentState();
  const onGesture = useAnimatedGestureHandler({
    onActive: (event, context) => {
      console.log('ON_ACTIVE: ', { event, context });
      runOnJS(() => console.log('sadasd'));
    },
    onCancel: (event, context) => {
      console.log('ON_CANCEL: ', { event, context });
    },
    onStart: (event, context) => {
      console.log('ON_START: ', { event, context });
    },
    onEnd: (event, context) => {
      console.log('ON_END: ', { event, context });
    },
    onFail: (event, context) => {
      console.log('ON_FAIl: ', { event, context });
    },
    onFinish: (event, context) => {
      console.log('ON_FINISH: ', { event, context });
    },
  });
  return {
    // panHandlers: hasInteractions ? panResponder.panHandlers : {},
    componentState: state,
    onGesture,
    onBlur,
    onHover,
  };
}
