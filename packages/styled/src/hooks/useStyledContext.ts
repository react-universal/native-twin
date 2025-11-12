import type { RuntimeContext } from '@native-twin/css';
import { useSyncExternalStore } from 'react';

const globalStore: any = {};

export const useStyledContext = () => {
  const context = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().context,
    () => globalStore.getState().context,
  );

  const onChangeColorScheme = (scheme: RuntimeContext['colorScheme']) => {
    if (context.colorScheme !== scheme) {
      globalStore.setState((prevState: any) => {
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
