import { sheetEntriesToCss } from '@native-twin/css';
import { FileSystem, Path } from '@effect/platform';
import * as RA from 'effect/Array';
import * as Console from 'effect/Console';
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
    RA.map((filename) => readDirectoryRecursive(filename)),
    Effect.allSuccesses,
  ).pipe(Effect.map((x) => pipe(x, RA.flatten, RA.dedupe)));
});

const refreshCSSOutput = (filepath: string) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroConfigService;
    const fs = yield* FileSystem.FileSystem;

    fs.writeFile(
      filepath,
      new TextEncoder().encode(sheetEntriesToCss(ctx.twin.target, true)),
    );
  });
};

const runTwinForFiles = (files: string[], platform: string) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroConfigService;

    yield* Console.log('Building project for ', platform, '...');
    const classes = yield* pipe(
      files,
      RA.map((x) => getFileClasses(x)),
      Effect.allSuccesses,
    );
    RA.forEach(classes, (x) => ctx.twin(`${x}`));
    yield* refreshCSSOutput(ctx.userConfig.outputCSS);
    yield* Console.log('Build success with', ctx.twin.target.length, 'classes');
  });
};

export function setupPlatform(platform: string) {
  return Effect.gen(function* () {
    const allFiles = yield* getAllFilesInProject;

    const currentSize = initialized.size;
    if (!initialized.has(platform)) {
      yield* Console.log('Initializing', platform, 'project');
      yield* runTwinForFiles(allFiles, platform);

      initialized.add(platform);

      if (currentSize === 0) {
        yield* Console.log('Starting file watcher');
        yield* startWatcher(platform).pipe(Effect.forkDaemon);
      }
    }
  });
}

function startWatcher(platform: string) {
  return Effect.gen(function* () {
    const ctx = yield* MetroConfigService;
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
    const watchPaths = pipe(
      ctx.userConfig.allowedPaths,
      RA.map((x) => path.dirname(x)),
      RA.dedupe,
    );

    yield* pipe(
      Stream.fromIterable(watchPaths),
      Stream.flatMap(fs.watch),
      Stream.map((watchEvent) => ({
        ...watchEvent,
        path: path.resolve(ctx.userConfig.projectRoot, watchEvent.path),
      })),
      Stream.filter((watchEvent) => {
        return ctx.isAllowedPath(watchEvent.path);
      }),
      Stream.tap((x) => Console.log('File change detected: ', x)),

      Stream.runForEach((watcher) => {
        return runTwinForFiles(asArray(watcher.path), platform);
      }),
    );
  });
}
