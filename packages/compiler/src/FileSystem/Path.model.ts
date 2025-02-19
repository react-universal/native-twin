import * as NodePath from 'node:path';
import * as Branded from 'effect/Brand';
import * as Schema from 'effect/Schema';

export declare namespace TwinNodePath {
  export type AbsolutePath = Branded.Branded<string, 'paths/AbsolutePath'>;
  export type GlobPath = Branded.Branded<string, 'paths/GlobPath'>;
  export type FilePath = Branded.Branded<string, 'paths/FilePath'>;
}

const posixSep = NodePath.posix.sep;
const isPosixPathString = (path_: string) => path_.includes(posixSep);

const absolutePath = Branded.refined<TwinNodePath.AbsolutePath>(
  (path_) => NodePath.isAbsolute(path_),
  (path_) =>
    Branded.error(
      `Expected an absolute path (i.e. starting with '/' or '\\'), but got ${path_}`,
    ),
);
const filePath = Branded.refined<TwinNodePath.FilePath>(
  (path_) => NodePath.extname(path_) !== '',
  (path_) => Branded.error(`expecting filename to contains extension but got ${path_}`),
);

export const AbsolutePath = Schema.String.pipe(Schema.fromBrand(absolutePath));
export type AbsolutePath = typeof AbsolutePath.Type;
export const absolutePathFromString = (
  path_: string,
  cwd = process.cwd(),
): AbsolutePath => {
  if (!NodePath.isAbsolute(path_)) {
    return AbsolutePath.make(NodePath.join(cwd, path_));
  }

  return isPosixPathString(path_)
    ? AbsolutePath.make(path_)
    : AbsolutePath.make(path_.split(posixSep).join(posixSep));
};

export const FilePath = Schema.String.pipe(Schema.fromBrand(filePath));
export type FilePath = typeof FilePath.Type;
export const filePathFromString = (path_: string, cwd = process.cwd()): FilePath =>
  FilePath.make(absolutePathFromString(path_, cwd));

export { NodePath };
