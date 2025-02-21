import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { CompilerConfigContext, TwinNodeContext, TwinNodeContextLive } from '../Config';
import { FSUtils } from '../internal/fs';
import { TwinFileResult } from './Models';
import * as TwinPath from './Path.model';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const env = yield* CompilerConfigContext;
  const fs = yield* FSUtils.FsUtils;

  return {
    readPlatformCSSFile,
    getFile,
    createTwinFiles,
    getFullFilePathFromStr,
  };

  function getFile(filepath: string, text?: string) {
    return Effect.gen(function* () {
      const realPath =
        TwinPath.NodePath.extname(filepath) !== ''
          ? TwinPath.filePathFromString(filepath)
          : yield* getFullFilePathFromStr(filepath);
      let contents = text;
      if (!contents) contents = yield* fs.readFile(realPath);

      return new TwinFileResult(realPath, contents);
    });
  }

  function getFullFilePathFromStr(filename: string) {
    const dirname = TwinPath.NodePath.dirname(filename);
    return Effect.gen(function* () {
      const dirFiles = yield* fs
        .readDir(dirname, {
          recursive: false,
        })
        .pipe(Effect.map(RA.map((x) => TwinPath.NodePath.join(dirname, x))));

      return RA.findFirst(dirFiles, (x) => x.startsWith(filename)).pipe(
        Option.map((path) => TwinPath.filePathFromString(path)),
        Option.getOrThrow,
      );
    });
  }

  function readPlatformCSSFile(platform: string) {
    return fs.readFile(TwinPath.filePathFromString(ctx.getOutputCSSPath(platform)));
  }

  function createTwinFiles() {
    return Effect.gen(function* () {
      yield* fs
        .mkdirCached(TwinPath.absolutePathFromString(env.outputDir))
        .pipe(Effect.tapError(() => Effect.logError('cant create twin output')));

      yield* fs.writeFileCached({ path: env.platformPaths.ios, override: false });
      yield* fs.writeFileCached({
        path: env.platformPaths.android,
        override: false,
      });
      yield* fs.writeFileCached({
        path: env.platformPaths.defaultFile,
        override: false,
      });
      yield* fs.writeFileCached({ path: env.platformPaths.native, override: false });
      yield* fs.writeFileCached({ path: env.platformPaths.web, override: false });
    });
  }
});

export interface TwinFSContext extends Effect.Effect.Success<typeof make> {}

export const TwinFSContext = Context.GenericTag<TwinFSContext>('metro/fs/service');

export const TwinFSContextLive = Layer.scoped(TwinFSContext, make).pipe(
  Layer.provide(FSUtils.FsUtilsLive),
  Layer.provide(TwinNodeContextLive),
);
