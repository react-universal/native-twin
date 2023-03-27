import postcss from 'postcss';
import postcssVariables from 'postcss-css-variables';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';
import { postcssPluginReactNativeColors } from '../plugins/colors';
import { createTailwindcssPlugin } from './create-tailwind-css-plugin';
import { defaultTailwindCSS } from './default-tailwind-css';

interface ProcessTailwindCSSArgs {
  content: string;
  resolvedTailwindConfig: TailwindConfig;
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
    postcssPluginReactNativeColors(),
  ]);
  const result = processor.process(defaultTailwindCSS, { from: undefined });
  return result.css;
};
