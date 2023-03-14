import resolveConfig from 'tailwindcss/src/public/resolve-config.js';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';

const createTailwindConfig = (initialConfig: TailwindConfig) => {
  let tailwindConfig: TailwindConfig = resolveConfig({
    ...initialConfig,
  });
  return {
    getConfig: (): TailwindConfig => {
      return tailwindConfig;
    },
    setConfig: (userConfig: TailwindConfig): TailwindConfig => {
      tailwindConfig = resolveConfig(userConfig);
      return tailwindConfig;
    },
  };
};

export { createTailwindConfig };
