import { sheetEntriesToCss } from '@native-twin/css';
import { FileSystem, Path } from '@effect/platform';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Stream from 'effect/Stream';
import { asArray } from '@native-twin/helpers';
import { MetroConfigService } from '../MetroConfig.service';
import { readDirectoryRecursive, getFileClasses } from '../utils/file.utils';

const initialized: Set<string> = new Set();

export const getAllFilesInProject = Effect.gen(function* () {
  const ctx = yield* MetroConfigService;

  return yield* pipe(
    ctx.userConfig.allowedPaths,
    RA.map(readDirectoryRecursive),
    Effect.allSuccesses,
  ).pipe(Effect.map((x) => pipe(x, RA.flatten, RA.dedupe)));
});

const refreshCSSOutput = (filepath: string) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroConfigService;
    const fs = yield* FileSystem.FileSystem;

    yield* fs.writeFile(
      filepath,
      new TextEncoder().encode(sheetEntriesToCss(ctx.twin.target, true)),
    );
  });
};

const runTwinForFiles = (files: string[], platform: string) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroConfigService;

    yield* Effect.log('Building project...');

    const classes = yield* pipe(
      files,
      RA.map((x) => getFileClasses(x)),
      Effect.allSuccesses,
    );
    RA.forEach(classes, (x) => ctx.twin(`${x}`));

    yield* refreshCSSOutput(ctx.userConfig.outputCSS);
    yield* Effect.log(`Build success!`);
    yield* Effect.log(
      `Added ${ctx.twin.target.length} classes`,
    );
  });
};

export const setupPlatform = Effect.scoped(
  Effect.gen(function* () {
    const allFiles = yield* getAllFilesInProject;
    const platform = 'web';

    const hasPlatform = initialized.has(platform);
    const currentSize = initialized.size;
    if (!hasPlatform) {
      initialized.add(platform);
      if (currentSize === 0) {
        yield* Effect.log(`Initializing project \n`);
      }
      yield* runTwinForFiles(allFiles, platform);
      if (currentSize === 0) {
        yield* startWatcher.pipe(Effect.forkDaemon);
        yield* Effect.yieldNow();
        yield* Effect.log(`Watcher started`);
      }
    }
  }),
);

export const startWatcher = Effect.gen(function* () {
  const path = yield* Path.Path;
  const allFiles = yield* getAllFilesInProject;
  const platform = 'web';

  const watchFiles = pipe(
    allFiles,
    RA.map((x) => path.dirname(x)),
    RA.dedupe,
  );

  const allWatchers = yield* Effect.all(RA.map(watchFiles, createWatcherFor));

  yield* pipe(
    allWatchers,
    Stream.mergeAll({
      concurrency: watchFiles.length,
    }),

    Stream.runForEach((watcher) => {
      return runTwinForFiles(asArray(watcher.path), platform);
    }),
  );
}).pipe(Effect.forkDaemon);

const createWatcherFor = (basePath: string) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroConfigService;
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;

    return pipe(
      fs.watch(basePath),
      Stream.map((watchEvent) => ({
        ...watchEvent,
        path: path.resolve(basePath, watchEvent.path),
      })),
      Stream.filter((watchEvent) => ctx.isAllowedPath(watchEvent.path)),
      Stream.tap((x) => Effect.log(`File change detected: ${x.path} \n`)),
    );
  });
};
