import { useMemo, useState } from 'react';

export const useOnFocus = () => {
  // use state on web for now till useAnimatedStyle bug is resolved
  const [state, setFocused] = useState(0);

  const focusHandler = useMemo(() => {
    return {
      onFocus: () => {
        setFocused(1);
      },
      onBlur: () => {
        setFocused(0);
      },
      focused: { value: state },
    };
  }, [state]);

  return focusHandler;
};
