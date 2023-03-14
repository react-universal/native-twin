/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import { getScrollParent } from '@medico/universal/utils';

export function useWebScroll<T>(
  ele: React.RefObject<T>,
  onScroll: (evt: Event) => void,
  deps: any[] = [],
) {
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const handleScroll = (evt: Event) => {
      onScroll(evt);
    };
    if (ele.current) {
      const parentElement = getScrollParent(ele.current as any);

      parentElement.addEventListener('scroll', handleScroll);

      return () => {
        parentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [deps]);
}
