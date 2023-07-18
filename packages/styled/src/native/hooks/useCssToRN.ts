import { useCallback, useId, useMemo, useSyncExternalStore } from 'react';
import { SheetManager } from '../sheet';
import { GlobalStore, globalStore } from '../store';
import { useStyledContext } from './useStyledContext';

export function useCssToRN(className: string) {
  const componentID = useId();

  const { context } = useStyledContext();

  const stylesheet = useMemo(() => {
    const manager = SheetManager(context);
    const result = manager(className);
    return result;
  }, [className, context]);

  return { stylesheet, componentID };
}

export function useStore<T>(fn: (store: GlobalStore) => T) {
  return useSyncExternalStore(
    globalStore.subscribe,
    useCallback(() => fn(globalStore.getState()), [fn]),
  );
}
