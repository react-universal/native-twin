import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';
import { postcssPluginReactNativeAspectRatio } from '../plugins/aspect-ratio';
import { postcssPluginReactNativeColors } from '../plugins/colors';
import { postcssPluginRemToPx } from '../plugins/rem-to-px';
import { createTailwindcssPlugin } from './create-tailwind-css-plugin';
import { defaultTailwindCSS } from './default-tailwind-css';

export const processTailwindCSS = (props: { config?: TailwindConfig; content: string }) => {
  const tailwindcssPlugin = createTailwindcssPlugin({
    config: props.config,
    content: props.content,
  });
  const processor = postcss([
    tailwindcssPlugin,
    postcssVariables(),
    postcssPluginRemToPx({ baseValue: 16 }),
    postcssPluginReactNativeColors(),
    postcssPluginReactNativeAspectRatio(),
  ]);
  const result = processor.process(defaultTailwindCSS, { from: undefined });
  return result.css;
};
