import * as FileSystem from '@effect/platform/FileSystem';
import * as Path from '@effect/platform/Path';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import chokidar from 'chokidar';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import * as Glob from 'glob';
import { createChokidarWatcher } from '../utils/effect.utils';

const make = Effect.gen(function* () {
  const rootDir = yield* Config.string('PROJECT_DIR').pipe(Config.withDefault(process.cwd()));
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;

  const glob = (pattern: string | ReadonlyArray<string>, options?: Glob.GlobOptions) =>
    Effect.tryPromise({
      try: () => Glob.glob(pattern as any, options as any),
      catch: (e) => new Error(`glob failed: ${e}`),
    }).pipe(Effect.withSpan('FsUtils.glob'));

  const globFiles = (pattern: string | ReadonlyArray<string>, options: Glob.GlobOptions = {}) =>
    glob(pattern, { ...options, nodir: true });

  const modifyFile = (path: string, f: (s: string, path: string) => string) =>
    fs.readFileString(path).pipe(
      Effect.bindTo('original'),
      Effect.let('modified', ({ original }) => f(original, path)),
      Effect.flatMap(({ modified, original }) =>
        original === modified
          ? Effect.void
          : fs.writeFile(path, new TextEncoder().encode(modified)),
      ),
      Effect.withSpan('FsUtils.modifyFile', { attributes: { path } }),
    );

  const mkdirCached_ = yield* Effect.cachedFunction((path: string) =>
    fs.makeDirectory(path, { recursive: true }).pipe(
      Effect.catchAllCause(() => Effect.void),
      Effect.withSpan('FsUtils.mkdirCached', { attributes: { path } }),
    ),
  );

  const mkdirCached = (path: string) => mkdirCached_(path_.resolve(path));

  const createWatcher = (sourceFiles: string[]) =>
    Effect.sync(() =>
      createChokidarWatcher(
        rootDir,
        chokidar.watch(sourceFiles, {
          usePolling: false,
          cwd: rootDir,
          useFsEvents: true,
          followSymlinks: false,
          persistent: true,
          ignoreInitial: true,
        }),
      ).pipe(
        Stream.tap((fs) => Effect.log('PATH: ', fs.path)),
        Stream.filter(
          (x) =>
            !x.path.endsWith('.d.ts') &&
            (path_.extname(x.path) === '.ts' || path_.extname(x.path) === '.tsx'),
        ),
        // Stream.tap((fs) => Effect.log('PATH_FT: ', fs.path)),
      ),
    );

  const getRelativePath = (path: string) => path.replace(rootDir, '').replace(/^\//, '');

  const getCJSPath = (path: string) => path.replace('/esm/', '/cjs/');

  const getFinalFileExtension = (path: string, extension: string = '.js') => {
    if (!path.includes('.jsx')) return path.replace(/.js$/, `${extension ?? '.js'}`);
    if (path.endsWith('.jsx')) {
      return path.replace(/.jsx$/, extension ?? '.js');
    }
    if (path.endsWith('.jsx.map')) {
      return path.replace(/.jsx.map$/, `${extension ?? '.js'}.map`);
    }
    return path.replace(/.js$/, `${extension ?? '.js'}`);
  };

  const getOriginalSourceForESM = (path: string) => {
    let replaceWith = '.ts';
    let replaceOrigin = /.js$/;
    if (path.endsWith('.jsx')) {
      replaceWith = '.tsx';
      replaceOrigin = /.jsx$/;
    }
    return path.replace('/build/esm/', '/src/').replace(replaceOrigin, replaceWith);
  };

  return {
    glob,
    globFiles,
    modifyFile,
    mkdirCached,
    getFinalFileExtension,
    createWatcher,
    getRelativePath,
    getCJSPath,
    getOriginalSourceForESM,
  } as const;
});

export interface FsUtils extends Effect.Effect.Success<typeof make> {}
export const FsUtils = Context.GenericTag<FsUtils>('twin/FsUtils');
export const FsUtilsLive = Layer.effect(FsUtils, make).pipe(
  Layer.provide(NodeFileSystem.layer),
  Layer.provide(NodePath.layerPosix),
);
