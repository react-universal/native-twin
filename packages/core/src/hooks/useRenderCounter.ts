import { useRef } from 'react';

const useRenderCounter = () => {
  const renderCount = ++useRef(0).current;
  console.log('RENDER_COUNT: ', renderCount);
  return renderCount;
};

export { useRenderCounter };
