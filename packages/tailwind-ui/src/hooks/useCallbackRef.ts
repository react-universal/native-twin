import { useLayoutEffect, useRef } from 'react';

const useCallbackRef = <T extends unknown>(callback: T) => {
  const callbackRef = useRef<T>(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  return callbackRef;
};

export { useCallbackRef };
