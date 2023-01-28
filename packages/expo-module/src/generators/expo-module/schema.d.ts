export interface ExpoModuleGeneratorSchema {
  name: string;
  tags?: string;
  scope: 'primitives' | 'core';
}

export interface NormalizedSchema extends Schema {
  js: boolean;
  name: string;
  fileName: string;
  projectRoot: string;
  routePath: string;
  projectDirectory: string;
  parsedTags: string[];
  appMain?: string;
  appSourceRoot?: string;
  libsDir?: string;
  unitTestRunner: 'jest' | 'vitest' | 'none';
}
