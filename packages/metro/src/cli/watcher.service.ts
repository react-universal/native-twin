import * as FS from '@effect/platform/FileSystem';
import chokidar from 'chokidar';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import type { __Theme__ } from '@native-twin/core';

export class FileWatcherService extends Context.Tag('Files/watcher')<
  FileWatcherService,
  {
    register: (paths: string[]) => Stream.Stream<FS.WatchEvent, string, never>;
  }
>() {
  static Live = Layer.succeed(FileWatcherService, {
    register(paths) {
      return createFileWatcher(paths);
    },
  });
}

const createFileWatcher = (watchFolders: string[]) => {
  return Stream.asyncScoped<FS.WatchEvent, string>((emit) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const watcher = chokidar.watch(watchFolders, {
          ignored: ['!**/*.{js,ts,tsx,jsx}'],
        });
        watcher.on('all', (event, path, stats) => {
          emit.chunk(
            Chunk.unsafeFromArray(
              [{ event, path }].map(({ event, path }) => {
                switch (event) {
                  case 'add':
                    return FS.WatchEventCreate({ path });
                  case 'addDir':
                    return FS.WatchEventRemove({ path });
                  case 'change':
                    return FS.WatchEventUpdate({ path });
                  case 'unlink':
                    return FS.WatchEventRemove({ path });
                  case 'unlinkDir':
                    return FS.WatchEventRemove({ path });
                }
              }),
            ),
          );
        });

        return watcher;
      }),
      (x) =>
        Effect.sync(() => {
          console.log('CLOSEEE!!!');
          return x.close();
        }),
    ),
  );
};

export const getFile = (filePath: string) => {
  return Effect.scoped(
    Effect.gen(function* () {
      const fs = yield* FS.FileSystem;
      const file = yield* fs.open(filePath, { flag: 'a+' });
      yield* file.seek(FS.Size(0), 'start');
      const text = yield* fs.readFileString(filePath, 'utf-8');
      return text;
    }),
  );
};
