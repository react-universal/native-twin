import { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export const useOnPress = () => {
  const pressed = useSharedValue(0);

  const pressHandler = useMemo(() => {
    return {
      onPressIn: () => {
        pressed.value = 1;
      },
      onPressOut: () => {
        pressed.value = 0;
      },
      pressed: pressed,
    };
  }, [pressed]);

  return pressHandler;
};
