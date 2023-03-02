import { useDebugValue, useEffect, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import storeManager from '../store/StoreManager';

function useStore(classNames: string) {
  const componentID = useMemo(() => {
    return storeManager.getState().registerComponent({
      inlineStyles: {},
      className: classNames,
    });
  }, [classNames]);

  useEffect(() => {
    return () => storeManager.getState().unregisterComponent(componentID);
  }, [componentID]);
  useDebugValue(`Store size: ${storeManager.getState().components.size}`);

  return useSyncExternalStore(
    storeManager.subscribe,
    () => storeManager.getState().components.get(componentID)!,
    () => storeManager.getState().components.get(componentID)!,
  );
}

export { useStore };
