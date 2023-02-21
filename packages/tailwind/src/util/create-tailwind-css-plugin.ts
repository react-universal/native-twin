import type { AcceptedPlugin } from 'postcss';
import processTailwindFeatures from 'tailwindcss/src/processTailwindFeatures.js';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';

export const createTailwindcssPlugin = (props: {
  config?: TailwindConfig;
  content: string;
}): AcceptedPlugin => {
  const config = props.config ?? {};
  const tailwindConfig = resolveConfig(config);
  const tailwindcssPlugin = processTailwindFeatures((processOptions) => () => {
    return processOptions.createContext(tailwindConfig, [{ content: props.content }]);
  });
  return tailwindcssPlugin;
};
