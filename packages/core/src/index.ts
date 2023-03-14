import postcss from 'postcss';
import postcssJs from 'postcss-js';
import type { Config } from 'tailwindcss';
import { createTailwindConfig } from './config/tailwind-config';
import { processTailwindCSS } from './util/process-tailwind-css';

const setup = (config: Config) => {
  const resolvedTailwindConfig = createTailwindConfig({
    ...config,
    content: config.content ?? ['__'],
    corePlugins: {
      ...config.corePlugins,
      // @ts-expect-error
      preflight: false,
      gridAutoColumns: false,
      gridAutoFlow: false,
      gridAutoRows: false,
      gridColumn: false,
      gridColumnEnd: false,
      gridColumnStart: false,
      gridRow: false,
      gridRowEnd: false,
      gridRowStart: false,
      gridTemplateColumns: false,
      gridTemplateRows: false,
      willChange: false,
    },
    darkMode: 'media',
  });
  return {
    style: (twClasses: string) => {
      const css = processTailwindCSS({
        content: twClasses,
        resolvedTailwindConfig,
      });
      const postcssRoot = postcss.parse(css);
      const output = postcssJs.objectify(postcssRoot);
      return {
        css,
        JSS: output,
        postcssRoot,
      };
    },
    tailwindConfigHandler: resolvedTailwindConfig,
  };
};

export { setup };
