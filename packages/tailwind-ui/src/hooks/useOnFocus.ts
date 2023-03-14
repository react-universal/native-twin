import { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export const useOnFocus = () => {
  const focused = useSharedValue(0);

  const focusHandler = useMemo(() => {
    return {
      onFocus: () => {
        focused.value = 1;
      },
      onBlur: () => {
        focused.value = 0;
      },
      focused,
    };
  }, [focused]);

  return focusHandler;
};
