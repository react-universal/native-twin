import postcss from 'postcss';
import postcssJs from 'postcss-js';
import type { Config } from 'tailwindcss';
import { processTailwindCSS } from './util/process-tailwind-css';

const setup = (config: Config) => {
  return (twClasses: string) => {
    const css = processTailwindCSS({
      config: {
        corePlugins: { preflight: false },
        ...config,
      },
      content: twClasses,
    });
    const postcssRoot = postcss.parse(css);
    const output = postcssJs.objectify(postcssRoot);
    return {
      css,
      JSS: output,
      postcssRoot,
    };
  };
};

export { setup };
