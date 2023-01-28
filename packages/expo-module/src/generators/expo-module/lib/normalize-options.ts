import {
  extractLayoutDirectory,
  getImportPath,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  Tree,
} from '@nrwl/devkit';
import { NormalizedSchema, ExpoModuleGeneratorSchema } from '../schema';

export function normalizeOptions(
  host: Tree,
  options: ExpoModuleGeneratorSchema,
): NormalizedSchema {
  const name = names(options.name).fileName;
  const { projectDirectory, layoutDirectory } = extractLayoutDirectory(options.scope);
  const fullProjectDirectory = projectDirectory
    ? `${names(projectDirectory).fileName}/${name}`
    : name;

  const projectName = fullProjectDirectory.replace(new RegExp('/', 'g'), '-');
  const fileName = projectName;
  const { libsDir: defaultLibsDir, npmScope } = getWorkspaceLayout(host);
  const libsDir = layoutDirectory ?? defaultLibsDir;
  const projectRoot = joinPathFragments(libsDir, fullProjectDirectory);

  const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : [];

  const importPath = getImportPath(npmScope, fullProjectDirectory);

  const normalized = {
    ...options,
    fileName,
    routePath: `/${name}`,
    name: name,
    projectRoot,
    projectDirectory: fullProjectDirectory,
    parsedTags,
    importPath,
    libsDir,
    unitTestRunner: 'jest',
    js: false,
  } as NormalizedSchema;

  return normalized;
}
