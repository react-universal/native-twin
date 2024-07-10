import { useSyncExternalStore } from 'react';
import { RuntimeContext } from '@native-twin/css';
import { globalStore } from '../styled/store';

export const useStyledContext = () => {
  const context = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().context,
    () => globalStore.getState().context,
  );

  const onChangeColorScheme = (scheme: RuntimeContext['colorScheme']) => {
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
