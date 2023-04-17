import type { AcceptedPlugin } from 'postcss';
import processTailwindFeatures from 'tailwindcss/src/processTailwindFeatures.js';
import type { TailwindConfig } from 'tailwindcss/tailwindconfig.faketype';

interface CreateTailwindcssPluginArgs {
  content: string;
  resolvedTailwindConfig: TailwindConfig;
}
export const createTailwindcssPlugin = ({
  content,
  resolvedTailwindConfig,
}: CreateTailwindcssPluginArgs): AcceptedPlugin => {
  const tailwindcssPlugin = processTailwindFeatures((processOptions) => () => {
    return processOptions.createContext(resolvedTailwindConfig, [{ content: content }]);
  });
  return tailwindcssPlugin;
};
