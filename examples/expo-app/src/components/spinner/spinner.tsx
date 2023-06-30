import { useEffect } from 'react';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SpinnerView, SpinnerProps } from './spinner-view';

const Spinner = ({ duration = 750, ...rest }: SpinnerProps) => {
  const transition = useSharedValue(0);

  useEffect(() => {
    transition.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: transition.value + 'deg' }],
    };
  }, []);

  return (
    <Animated.View
      style={[{ height: 16, width: 16 }, animatedStyle]}
      accessibilityRole='progressbar'
    >
      <SpinnerView {...rest} />
    </Animated.View>
  );
};

export { Spinner };
