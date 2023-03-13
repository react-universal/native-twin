import { useDebugValue, useRef } from 'react';

const useRenderCounter = () => {
  const renderCount = ++useRef(0).current;
  useDebugValue(renderCount);
  return renderCount;
};

export { useRenderCounter };
