import { useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { css } from '../css';
import { globalStore } from '../store/global.store';

interface Props {
  className: string;
  componentID: string;
}
function useClassNamesToCss(input: Props) {
  const JSS = useMemo(() => {
    return css(input.className);
  }, [input.className]);

  const component = useSyncExternalStore(
    globalStore.subscribe,
    () => globalStore.getState().components[input.componentID]!,
    () => globalStore.getState().components[input.componentID]!,
  );
}

export { useClassNamesToCss };
