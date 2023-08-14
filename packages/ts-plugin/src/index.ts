import { TailwindPluginCreator } from './PluginCreator';

export = function init(modules: {
  typescript: typeof import('typescript/lib/tsserverlibrary');
}) {
  return new TailwindPluginCreator(modules.typescript);
};
