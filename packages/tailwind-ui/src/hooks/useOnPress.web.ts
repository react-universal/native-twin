import { useMemo, useState } from 'react';

export const useOnPress = () => {
  // use state on web for now till useAnimatedStyle bug is resolved
  const [state, setPressed] = useState(0);

  const pressHandler = useMemo(() => {
    return {
      onPressIn: () => {
        setPressed(1);
      },
      onPressOut: () => {
        setPressed(0);
      },
      pressed: { value: state },
    };
  }, [state]);

  return pressHandler;
};
