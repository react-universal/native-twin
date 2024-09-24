import * as t from '@babel/types';
import { FileSystem, Path } from '@effect/platform';
import { PlatformError } from '@effect/platform/Error';
import * as RA from 'effect/Array';
// import * as Console from 'effect/Console';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import {
  createBabelAST,
  extractMappedAttributes,
  getAstTrees,
  templateLiteralToStringLike,
} from '@native-twin/babel/jsx-babel';
import { cx } from '@native-twin/core';
import { MetroConfigService } from './MetroConfig.service';

export class TwinWatcherService extends Context.Tag('metro/files/watcher')<
  TwinWatcherService,
  {
    startFileWatcher: Effect.Effect<
      void,
      string | PlatformError,
      MetroConfigService | Path.Path | FileSystem.FileSystem
    >;
  }
>() {
  static Live = Layer.scoped(
    TwinWatcherService,
    Effect.gen(function* () {
      return {
        startFileWatcher,
      };
    }),
  );
}

export const startFileWatcher = Effect.gen(function* () {
  const { userConfig, isAllowedPath } = yield* MetroConfigService;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const watchPaths = pipe(
    userConfig.allowedPaths,
    RA.map((x) => path.dirname(x)),
    RA.dedupe,
  );

  yield* pipe(
    Stream.fromIterable(watchPaths),
    Stream.flatMap(fs.watch),
    Stream.map((watchEvent) => ({
      ...watchEvent,
      path: path.resolve(userConfig.projectRoot, watchEvent.path),
    })),
    Stream.filter((watchEvent) => {
      return isAllowedPath(watchEvent.path);
    }),
    Stream.mapError(() => ''),

    Stream.runForEach((watcher) => transformFile(watcher.path)),
  );
}).pipe(Effect.forever);

const transformFile = (filename: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(filename);

    if (!exists) return '';

    const contents = yield* fs.readFileString(filename);

    if (contents === '') return '';
    const ast = createBabelAST(contents);
    const trees = yield* getAstTrees(ast, filename);

    return pipe(
      trees,
      RA.flatMap((x) => x.all()),
      RA.flatMap((leave) => extractMappedAttributes(leave.value.babelNode)),
      RA.map(({ value }) => {
        let classNames = '';
        if (filename.includes('_layout')) {
          console.log(
            'TREES: ',
            trees.flatMap((x) => extractMappedAttributes(x.root.value.babelNode)),
          );
        }
        if (t.isStringLiteral(value)) {
          classNames = value.value;
        } else {
          const cooked = templateLiteralToStringLike(value);
          classNames = cooked.strings.replace('\n', ' ');
        }

        console.log('CX: ', classNames);
        return cx(`${classNames.trim()}`);
      }),
      RA.join(' '),
    );
  });
