import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Circle,
  Canvas,
  Fill,
  Group,
  BlurMask,
  polar2Canvas,
  mix,
  vec,
} from '@shopify/react-native-skia';
import {
  cancelAnimation,
  Easing,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface RingProps {
  index: number;
  progress: SharedValue<number>;
}

const ringColors = {
  c1: 'rgba(88, 200, 63, 0.4)',
  c2: 'rgba(49, 186, 163, 0.4)',
};
const Ring = ({ index, progress }: RingProps) => {
  const { width, height } = useWindowDimensions();
  const R = width / 4;
  const center = useMemo(() => {
    return vec(width / 2, height / 2);
  }, [height, width]);

  const theta = (index * (2 * Math.PI)) / 6;

  const transform = useDerivedValue(() => {
    const { x, y } = polar2Canvas(
      {
        theta,
        radius: progress.value * R,
      },
      { x: 0, y: 0 },
    );
    const scale = mix(progress.value, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, [progress]);

  return (
    <Group origin={center} transform={transform}>
      <Circle c={center} r={R} color={index % 2 ? ringColors.c1 : ringColors.c2} />
    </Group>
  );
};

export const JsonView = () => {
  const { width, height } = useWindowDimensions();
  const progress = useLoop({ duration: 3000 });

  const center = useMemo(() => {
    return vec(width / 2, height / 2);
  }, [height, width]);

  const transform = useDerivedValue(
    () => [{ rotate: mix(progress.value, -Math.PI, 0) }],
    [progress],
  );
  return (
    <Canvas style={styles.canvas}>
      <Fill color='rgb(36,43,56)' />
      <Group origin={center} transform={transform} blendMode='screen'>
        <BlurMask style='solid' blur={40} />
        {new Array(6).fill(0).map((_, i) => {
          return <Ring key={i} index={i} progress={progress} />;
        })}
      </Group>
    </Canvas>
  );
};

const JsonKeyView = () => {
  return <Circle cx={0} cy={0} r={0} />;
};

const styles = StyleSheet.create({
  canvas: { flex: 1 },
});

JsonView.JsonKeyView = JsonKeyView;

export default JsonView;

const useLoop = ({ duration }: { duration: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [duration, progress]);
  return progress;
};
