import type { AcceptedPlugin } from 'postcss';
import processTailwindFeatures from 'tailwindcss/src/processTailwindFeatures.js';
import type { createTailwindConfig } from '../config/tailwind-config';

interface CreateTailwindcssPluginArgs {
  content: string;
  resolvedTailwindConfig: ReturnType<typeof createTailwindConfig>;
}
export const createTailwindcssPlugin = ({
  content,
  resolvedTailwindConfig,
}: CreateTailwindcssPluginArgs): AcceptedPlugin => {
  const tailwindcssPlugin = processTailwindFeatures((processOptions) => () => {
    return processOptions.createContext(resolvedTailwindConfig.getConfig(), [
      { content: content },
    ]);
  });
  return tailwindcssPlugin;
};
