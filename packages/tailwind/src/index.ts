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
    const styleTuple: [string, string][] = Object.keys(output).map((rules) => [
      rules,
      output[rules],
    ]);
    return {
      css,
      JSS: output,
      postcssRoot,
      styleTuple,
    };
  };
};

export { setup };
