import type { PlatformError } from '@effect/platform/Error';
import * as FileSystem from '@effect/platform/FileSystem';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Hash from 'effect/Hash';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as TwinPath from './path';

export interface TwinFile {
  id: string;
  path: TwinPath.FilePath;
  code: string;
  dirname: string;
  basename: string;
}

const make = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;

  const mkdirCached_ = yield* Effect.cachedFunction((path: string) =>
    fs.makeDirectory(path).pipe(
      Effect.catchAllCause(() => Effect.void),
      Effect.withSpan('FsUtils.mkdirCached', { attributes: { path } }),
    ),
  );

  const mkdirCached = (path: TwinPath.AbsolutePath) => mkdirCached_(path);

  const readFile = (path: TwinPath.FilePath) =>
    fs
      .readFileString(path)
      .pipe(Effect.tapError(() => Effect.logError(`Cannot read file at: ${path}`)));

  const writeFile = (path: TwinPath.FilePath, content: string) =>
    fs.writeFile(path, Buffer.from(content, 'utf-8'));

  const writeFileCached_ = yield* Effect.cachedFunction(
    (data: { path: string; contents?: string; override?: boolean }) =>
      Effect.if(fs.exists(data.path), {
        onFalse: () =>
          fs.writeFileString(data.path, data.contents ?? '', { flag: 'a+' }).pipe(
            Effect.catchAllCause(() => Effect.void),
            Effect.withSpan('FsUtils.writeFileCached', { attributes: { data } }),
          ),
        onTrue: () => Effect.void,
      }),
  );

  const exists = (path: string) =>
    fs.exists(path).pipe(Effect.catchAll(() => Effect.succeed(false)));

  const writeFileCached = (data: { path: string; contents?: string; override?: boolean }) =>
    writeFileCached_(data);

  return {
    writeFile,
    writeFileCached,
    readFile,
    mkdirCached,
    getFile,
    createTempFile: fs.makeTempFile,
    exists,
    getFullFilePathFromStr,
    makeTempFile: (file: string, platform: string) =>
      fs.makeTempFile({
        directory: TwinPath.NodePath.dirname(file),
        prefix: `${TwinPath.NodePath.basename(file)}_${platform}_`,
      }),
  };

  function getFile(filepath: string, text?: string): Effect.Effect<TwinFile, PlatformError> {
    return Effect.gen(function* () {
      const realPath =
        TwinPath.NodePath.extname(filepath) !== ''
          ? TwinPath.filePathFromString(filepath)
          : yield* getFullFilePathFromStr(filepath);
      let contents = text;
      if (!contents) contents = yield* readFile(realPath);

      return {
        basename: TwinPath.NodePath.basename(filepath),
        dirname: TwinPath.NodePath.dirname(filepath),
        code: contents,
        id: `$${Hash.string(filepath)}`,
        path: realPath,
      };
    });
  }

  function getFullFilePathFromStr(filename: string) {
    const dirname = TwinPath.NodePath.dirname(filename);
    return Effect.gen(function* () {
      const dirFiles = yield* fs
        .readDirectory(dirname, { recursive: false })
        .pipe(Effect.map(RA.map((x) => TwinPath.NodePath.join(dirname, x))));

      return RA.findFirst(dirFiles, (x) => x.startsWith(filename)).pipe(
        Option.map((path) => TwinPath.filePathFromString(path)),
        Option.getOrThrow,
      );
    });
  }

  // function createTwinFiles() {
  //   return Effect.gen(function* () {
  //     yield* Effect.tapError(mkdirCached(absolutePathFromString(env.outputDir)), () =>
  //       Effect.logError('cant create twin output'),
  //     );

  //     yield* writeFileCached({ path: env.platformPaths.ios, override: false });
  //     yield* writeFileCached({
  //       path: env.platformPaths.android,
  //       override: false,
  //     });
  //     yield* writeFileCached({
  //       path: env.platformPaths.defaultFile,
  //       override: false,
  //     });
  //     yield* writeFileCached({ path: env.platformPaths.native, override: false });
  //     yield* writeFileCached({ path: env.platformPaths.web, override: false });
  //   });
  // }
});

export interface TwinFSContext extends Effect.Effect.Success<typeof make> {}

export const TwinFSContext = Context.GenericTag<TwinFSContext>('metro/fs/service');

export const TwinFSContextLive = Layer.scoped(TwinFSContext, make).pipe(
  Layer.provide(NodeFileSystem.layer),
);
