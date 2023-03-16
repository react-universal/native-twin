import { useLayoutEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export type PlatformRect = Pick<DOMRect, 'top' | 'left' | 'width' | 'height'> | null;

export function useWebClientRect<T>(ele: React.RefObject<T>) {
  const [clientRect, setClientRect] = useState<PlatformRect | null>(null);

  const updateClientRect = useMemo(() => {
    return () => {
      setClientRect((ele.current as any)?.getBoundingClientRect());
    };
  }, [ele]);

  useLayoutEffect(() => {
    if (ele.current && Platform.OS === 'web') {
      updateClientRect();
    }
  }, [ele, updateClientRect]);

  return [clientRect, updateClientRect] as [typeof clientRect, typeof updateClientRect];
}
