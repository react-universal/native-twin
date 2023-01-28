import { getWorkspaceLayout, joinPathFragments } from '@nrwl/devkit';
import { getRootTsConfigPathInTree } from '@nrwl/workspace/src/utilities/typescript';
import { Tree } from 'nx/src/generators/tree';
import { updateJson } from 'nx/src/generators/utils/json';
import { NormalizedSchema } from '../schema';

export function updateBaseTsConfig(host: Tree, options: NormalizedSchema) {
  updateJson(host, String(getRootTsConfigPathInTree(host)), (json) => {
    const c = json.compilerOptions;
    c.paths = c.paths || {};
    delete c.paths[options.name];

    const { libsDir } = getWorkspaceLayout(host);

    if (c.paths[`@react-/universal/${options.name}`]) {
      throw new Error(
        `You already have a library using the import path "@react-/universal/${options.name}". Make sure to specify a unique one.`,
      );
    }

    c.paths[`@react-/universal/${options.name}`] = [
      joinPathFragments(libsDir, `${options.projectDirectory}/src/index.ts`),
    ];

    return json;
  });
}
