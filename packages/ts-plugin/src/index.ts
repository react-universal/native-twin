import ts from 'typescript/lib/tsserverlibrary';
import { TailwindPluginCreator } from './PluginCreator';

export = function init(mod: { typescript: typeof ts }) {
  return new TailwindPluginCreator(mod.typescript);
};
