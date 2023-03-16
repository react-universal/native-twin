import { useDebugValue, useRef } from 'react';

const useRenderCounter = () => {
  const renderCount = ++useRef(0).current;
  // eslint-disable-next-line no-console
  console.log('RENDER!: ', renderCount);
  useDebugValue(renderCount);
  return renderCount;
};

export { useRenderCounter };
