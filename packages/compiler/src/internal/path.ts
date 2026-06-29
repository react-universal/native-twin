import * as NodePath from 'node:path';
import * as RA from 'effect/Array';
import * as Branded from 'effect/Brand';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';
import * as Glob from 'glob';

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

const globPath = Branded.nominal<TwinNodePath.GlobPath>();

export const GlobPath = Schema.String.pipe(Schema.fromBrand(globPath));
export type GlobPath = typeof GlobPath.Type;
export const globPathFromString = (path_: string) => GlobPath.make(path_);

export const UnknownPath = Schema.String.pipe(Schema.brand('UnknownPath'));
export const unknownPathFromString = (x: string) => UnknownPath.make(x);

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

export const NpmModulePath = Schema.String;
export type NpmModulePath = typeof NpmModulePath.Type;
export const ImportPath = Schema.Union(AbsolutePath, NpmModulePath);
export type ImportPath = typeof ImportPath.Type;

export const npmModulePathFromString = (path_: string): NpmModulePath => {
  return Schema.encodeSync(NpmModulePath)(path_);
};

export const FilePath = Schema.String.pipe(Schema.fromBrand(filePath));
export type FilePath = typeof FilePath.Type;
export const filePathFromString = (path_: string): FilePath => FilePath.make(path_);

export { NodePath };

export class TwinGlobsError extends Data.TaggedError('paths/TwinGlobsError')<{
  globs: GlobPath[];
  cause: Error;
}> {}

const globOptions: Glob.GlobOptionsWithFileTypesFalse = {
  absolute: true,
  withFileTypes: false,
};

export function glob(
  pattern: Iterable<GlobPath>,
): Effect.Effect<AbsolutePath[], TwinGlobsError>;
export function glob(
  pattern: Iterable<GlobPath>,
  mode: 'sync' | 'async',
): Effect.Effect<AbsolutePath[], TwinGlobsError>;
export function glob(
  pattern: Iterable<GlobPath>,
  mode: 'sync' | 'async',
  options: Glob.GlobOptionsWithFileTypesFalse,
): Effect.Effect<AbsolutePath[], TwinGlobsError>;
export function glob(
  pattern: Iterable<GlobPath>,
  mode: 'sync' | 'async' = 'async',
  options: Glob.GlobOptionsWithFileTypesFalse = globOptions,
): Effect.Effect<AbsolutePath[], TwinGlobsError> {
  return Effect.if(mode === 'sync', {
    onTrue: () =>
      Effect.try(() =>
        Glob.globSync(RA.fromIterable(pattern), { ...globOptions, ...options }),
      ),
    onFalse: () =>
      Effect.tryPromise(() =>
        Glob.glob(RA.fromIterable(pattern), { ...globOptions, ...options }),
      ),
  }).pipe(
    Effect.map((paths) =>
      RA.map(paths, (x) =>
        absolutePathFromString(
          x,
          typeof options.cwd === 'string' ? options.cwd : undefined,
        ),
      ),
    ),
    Effect.mapError(
      (error) =>
        new TwinGlobsError({
          globs: RA.fromIterable(pattern),
          cause: new Error(`glob failed: ${error.message}`),
        }),
    ),
    Effect.withSpan('fs/path/glob'),
  );
}
