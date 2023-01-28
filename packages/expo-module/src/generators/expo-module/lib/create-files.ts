import { generateFiles, joinPathFragments, names, offsetFromRoot } from '@nrwl/devkit';
import { getRelativePathToRootTsConfig } from '@nrwl/workspace/src/utilities/typescript';
import { Tree } from 'nx/src/generators/tree';
import { NormalizedSchema } from '../schema';
import { createTsConfig } from './create-tsconfig';

export function createFiles(host: Tree, options: NormalizedSchema) {
  const relativePathToRootTsConfig = getRelativePathToRootTsConfig(host, options.projectRoot);
  console.log('OPTIONS: ', options);
  const substitutions = {
    ...options,
    ...names(options.name),
    projectName: options.name,
    tmpl: '',
    offsetFromRoot: offsetFromRoot(options.projectRoot),
  };

  console.log('SUBSTITUSIONS: ', substitutions);

  generateFiles(
    host,
    joinPathFragments(__dirname, '../files'),
    options.projectRoot,
    substitutions,
  );

  createTsConfig(host, options.projectRoot, 'lib', options, relativePathToRootTsConfig);
}
