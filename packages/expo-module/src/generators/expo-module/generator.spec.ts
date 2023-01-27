import { Tree, readProjectConfiguration } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import generator from './generator';
import { ExpoModuleGeneratorSchema } from './schema';

describe('expo-module generator', () => {
  let appTree: Tree;
  const options: ExpoModuleGeneratorSchema = {
    name: 'test',
    scope: 'primitives',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
