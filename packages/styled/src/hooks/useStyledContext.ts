import { useSyncExternalStore } from 'react';
import { globalStore } from '../styled/store';
import type { StyledContext } from '../types/css.types';

export const useStyledContext = () => {
  const context = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().context,
  );

  const onChangeColorScheme = (scheme: StyledContext['colorScheme']) => {
    if (context.colorScheme != scheme) {
      globalStore.setState((prevState) => {
        prevState.context = {
          ...prevState.context,
          colorScheme: scheme,
        };
        return prevState;
      });
    }
  };
  return { context, onChangeColorScheme };
};
