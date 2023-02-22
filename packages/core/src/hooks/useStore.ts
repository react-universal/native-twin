import { useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { tailwindManager } from '../modules';

function useStore(classNames: string) {
  const getData = useMemo(() => tailwindManager.prepare(classNames), [classNames]);
  const subscribe = useMemo(() => {
    return (notify: () => void) => {
      tailwindManager.subscribe(notify);
      return () => {
        tailwindManager.unsubscribe(notify);
      };
    };
  }, []);
  return useSyncExternalStore(subscribe, () => getData);
}

export { useStore };
