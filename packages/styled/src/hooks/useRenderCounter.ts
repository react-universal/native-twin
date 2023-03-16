import { useDebugValue, useRef } from 'react';

const useRenderCounter = () => {
  const renderCount = ++useRef(0).current;
  console.log('RENDER!: ', renderCount);
  useDebugValue(renderCount);
  return renderCount;
};

export { useRenderCounter };
