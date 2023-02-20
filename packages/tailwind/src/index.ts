import type types from '..';
import { processTailwindCSS } from './util/process-tailwind-css';

const getCSS: typeof types.getCSS = (content, config) => {
  return processTailwindCSS({
    config: {
      corePlugins: { preflight: false },
      ...config,
    },
    content,
  });
};

export { getCSS };
