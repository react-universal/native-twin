import { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export const useOnHover = () => {
  const hovered = useSharedValue(0);

  const hoverHandler = useMemo(() => {
    return {
      onHoverIn: () => {
        hovered.value = 1;
      },
      onHoverOut: () => {
        hovered.value = 0;
      },
      hovered,
    };
  }, [hovered]);

  return hoverHandler;
};
