import { useEffect, useId, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import storeManager from '../store/StoreManager';

function useStore(classNames: string) {
  const id = useId();

  const component = useMemo(() => {
    return storeManager.getState().registerComponent({
      id,
      inlineStyles: {},
      className: classNames,
    });
  }, [id, classNames]);

  useEffect(() => {
    return () => storeManager.getState().unregisterComponent(id);
  }, [id]);

  return useSyncExternalStore(
    storeManager.subscribe,
    () => storeManager.getState().components[component],
    () => storeManager.getState().components[component],
  );
}

export { useStore };
