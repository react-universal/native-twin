import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import type { createTailwindConfig } from '../config/tailwind-config';
import { postcssPluginReactNativeAspectRatio } from '../plugins/aspect-ratio';
import { postcssPluginReactNativeColors } from '../plugins/colors';
// import { postcssPluginRemToPx } from '../plugins/rem-to-px';
import { createTailwindcssPlugin } from './create-tailwind-css-plugin';
import { defaultTailwindCSS } from './default-tailwind-css';

interface ProcessTailwindCSSArgs {
  content: string;
  resolvedTailwindConfig: ReturnType<typeof createTailwindConfig>;
}

export const processTailwindCSS = ({
  content,
  resolvedTailwindConfig,
}: ProcessTailwindCSSArgs) => {
  const tailwindcssPlugin = createTailwindcssPlugin({
    content,
    resolvedTailwindConfig,
  });
  const processor = postcss([
    tailwindcssPlugin,
    postcssVariables(),
    // postcssPluginRemToPx({ baseValue: 16 }),
    postcssPluginReactNativeColors(),
    postcssPluginReactNativeAspectRatio(),
  ]);
  const result = processor.process(defaultTailwindCSS, { from: undefined });
  return result.css;
};
