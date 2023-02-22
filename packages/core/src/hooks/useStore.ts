import { useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store';
import { classNameParser } from '../modules';

function useStore(classNames: string) {
  const getData = useMemo(() => classNameParser.prepare(classNames), [classNames]);
  const subscribe = useMemo(() => {
    return (notify: () => void) => {
      classNameParser.subscribe(notify);
      return () => {
        classNameParser.unsubscribe(notify);
      };
    };
  }, []);
  return useSyncExternalStore(subscribe, () => getData);
}

export { useStore };
