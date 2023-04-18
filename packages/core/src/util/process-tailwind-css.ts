import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';
import { createTailwindcssPlugin, defaultTailwindCSS } from '.';
import { postcssPluginRemToPx } from './plugins/rem-to-px';

export const processTailwindCSS = (props: { config?: TailwindConfig; content: string }) => {
  const tailwindcssPlugin = createTailwindcssPlugin({
    config: props.config,
    content: props.content,
  });
  const processor = postcss([tailwindcssPlugin, postcssVariables(), postcssPluginRemToPx()]);
  const result = processor.process(defaultTailwindCSS, { from: undefined });
  return result.css;
};
