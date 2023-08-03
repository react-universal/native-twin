import postcss from 'postcss';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';
import { createTailwindcssPlugin, defaultTailwindCSS } from '.';
import { postcssPluginRemToPx } from './plugins/rem-to-px';

export const processTailwindCSS = (props: { config?: TailwindConfig; content: string }) => {
  const tailwindcssPlugin = createTailwindcssPlugin({
    config: props.config,
    content: props.content,
  });
  const processor = postcss([tailwindcssPlugin, postcssPluginRemToPx()]);
  const parsed = postcss.parse(defaultTailwindCSS);
  const result = processor.process(parsed, { parser: postcss.parse });
  return result.css;
};
