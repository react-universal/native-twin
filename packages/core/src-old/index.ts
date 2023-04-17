import postcss from 'postcss';
import postcssJs from 'postcss-js';
import type { Config } from 'tailwindcss';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';
import { processTailwindCSS } from './util/process-tailwind-css';

const setup = (config: Config) => {
  const resolvedTailwindConfig = resolveConfig({
    ...config,
    content: config.content ?? ['__'],
    corePlugins: {
      ...config.corePlugins,
      // @ts-expect-error
      preflight: false,
      backgroundOpacity: false,
      borderOpacity: false,
      inset: false,
      position: false,
      boxShadow: false,
      borderRadius: false,
      boxShadowColor: false,
      lineHeight: false,
      divideColor: false,
      divideOpacity: false,
      gap: false,
      divideStyle: false,
      divideWidth: false,
      fontSize: false,
      placeholderOpacity: false,
      ringOpacity: false,
      rotate: false,
      padding: false,
      margin: false,
      scale: false,
      skew: false,
      space: false,
      textOpacity: false,
      translate: false,
    },
    darkMode: 'media',
  });
  return (twClasses: string) => {
    const css = processTailwindCSS({
      content: twClasses,
      resolvedTailwindConfig,
    });
    const postcssRoot = postcss.parse(css);
    return postcssJs.objectify(postcssRoot);
  };
};

export { setup };
