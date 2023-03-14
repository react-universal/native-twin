import type { Config } from 'tailwindcss';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';

const createTailwindConfig = (initialConfig: Config) => {
  let tailwindConfig: Config = {
    ...initialConfig,
  };
  return {
    getConfig: () => {
      return resolveConfig(tailwindConfig);
    },
    setConfig: (userConfig: Config) => {
      tailwindConfig = userConfig;
      return resolveConfig(tailwindConfig);
    },
  };
};

export { createTailwindConfig };
