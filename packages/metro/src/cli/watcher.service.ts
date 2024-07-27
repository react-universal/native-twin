import * as NodeFileSystem from '@effect/platform-node-shared/NodeFileSystem';
import * as FS from '@effect/platform/FileSystem';
import chokidar from 'chokidar';
import * as ReadOnlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import micromatch from 'micromatch';
import path from 'path';
import type { TailwindConfig, __Theme__ } from '@native-twin/core';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type { MetroConfigInternal } from '../metro.types';

export const createWatcher = (
  config: MetroConfigInternal,
  twConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>,
) => {
  const allowedFiles = twConfig.content
    .map((x) => path.join(config.projectRoot, x))
    .map((x) => micromatch.scan(x));

  const watchPaths = allowedFiles.map((x) => x.base.replace(config.projectRoot, '.'));

  return {
    watcher: chokidar.watch(watchPaths),
    processFiles,
  };
};

export const processFiles = (paths: string[], config: MetroConfigInternal) => {
  return Effect.scoped(
    Effect.gen(function* () {
      const files = yield* Effect.all(
        pipe(
          ReadOnlyArray.fromIterable(paths),
          ReadOnlyArray.map((x) => getFile(x)),
        ),
      );
      return files;
    }),
  ).pipe(
    Effect.provide(NodeFileSystem.layer),
    Effect.runPromise,
    //
  );
};

export const getFile = (filePath: string) => {
  return Effect.gen(function* ($) {
    const fs = yield* FS.FileSystem;

    const file = yield* fs.open(filePath, { flag: 'a+' });
    yield* file.seek(FS.Size(0), 'start');
    const text = yield* fs.readFileString(filePath);
    return text;
  });
};
