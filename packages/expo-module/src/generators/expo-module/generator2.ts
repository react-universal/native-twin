import {
  GeneratorCallback,
  Tree,
  addProjectConfiguration,
  convertNxGenerator,
  joinPathFragments,
} from '@nrwl/devkit';
import { createFiles } from './lib/create-files';
import { extractTsConfigBase } from './lib/create-tsconfig';
import { normalizeOptions } from './lib/normalize-options';
import { updateBaseTsConfig } from './lib/update-base-tsconfig';
import { ExpoModuleGeneratorSchema } from './schema';

export async function libraryGenerator(host: Tree, schema: ExpoModuleGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  tasks;

  const options = normalizeOptions(host, schema);
  extractTsConfigBase(host);
  addProjectConfiguration(host, options.name, {
    root: options.projectRoot,
    projectType: 'library',
    sourceRoot: joinPathFragments(options.projectRoot, 'src'),
    targets: {
      build: {
        executor: '@react-universal/expo-module:build',
      },
    },
    tags: [...options.parsedTags, schema.scope],
  });
  createFiles(host, options);
  updateBaseTsConfig(host, options);
}

export default libraryGenerator;
export const expoLibrarySchematic = convertNxGenerator(libraryGenerator);
