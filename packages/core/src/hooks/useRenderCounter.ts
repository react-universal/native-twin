import { useRef } from 'react';

const useRenderCounter = (id?: string) => {
  const renderCount = ++useRef(0).current;
  console.log('RENDER_COUNT: ', renderCount, id);
  return renderCount;
};

export { useRenderCounter };
