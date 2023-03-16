/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';

export const usePlatformResize = (onResize: (evt?: Event) => any, isInit = false) => {
  useLayoutEffect(() => {
    const handleResize = (evt: Event) => {
      onResize(evt);
    };
    if (isInit) {
      onResize();
    }
    Platform.OS === 'web' && window.addEventListener('resize', handleResize);
    return function cleanup() {
      Platform.OS === 'web' && window.removeEventListener('resize', handleResize);
    };
  }, [onResize]);
};
