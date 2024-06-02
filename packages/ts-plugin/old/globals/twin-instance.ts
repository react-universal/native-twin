import { createTailwind, createThemeContext, defineConfig } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { presetTailwind } from '@native-twin/preset-tailwind';

function createTwin(userConfig: object = {}) {
  const config = defineConfig({
    content: [],
    presets: [presetTailwind()],
    theme: {
      extend: {
        ...userConfig,
      },
    },
  });
  const tw = createTailwind(config, createVirtualSheet());
  const context = createThemeContext(config);

  return {
    config,
    tw,
    context,
  };
}

export const twinInstance = createTwin();
