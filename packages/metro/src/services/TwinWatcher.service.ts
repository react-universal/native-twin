import { sheetEntriesToCss } from '@native-twin/css';
// import generate from '@babel/generator';
import * as t from '@babel/types';
import { FileSystem, Path } from '@effect/platform';
import { PlatformError } from '@effect/platform/Error';
import * as RA from 'effect/Array';
import * as Console from 'effect/Console';
// import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
// import { inspect } from 'util';
import {
  createBabelAST,
  extractMappedAttributes,
  getAstTrees,
  templateLiteralToStringLike,
} from '@native-twin/babel/jsx-babel';
import { cx } from '@native-twin/core';
// import { mappedComponents } from '../utils';
import { MetroConfigService } from './MetroConfig.service';
import { readDirectoryRecursive } from './utils/file.utils';

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

export const startFileWatcher = Effect.gen(function* ($) {
  const { userConfig, isAllowedPath, twin } = yield* MetroConfigService;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // const attributes = pipe(
  //   mappedComponents,
  //   RA.flatMap((x) => Object.keys(x.config)),
  //   RA.dedupe,
  // );

  const watchPaths = pipe(
    userConfig.allowedPaths,
    RA.map((x) => path.dirname(x)),
    RA.dedupe,
  );

  const allPaths = yield* pipe(
    userConfig.allowedPaths,
    RA.map((filename) => readDirectoryRecursive(filename)),
    Effect.all,
  );

  // console.log('ALL_PATHS: ', allPaths);

  const mapped = yield* pipe(
    allPaths,
    RA.flatten,
    RA.filter((x) => x !== ''),
    RA.map((filename) =>
      transformFile(filename).pipe(
        Effect.map((contents) => ({
          filename,
          contents,
        })),
      ),
    ),
    Effect.all,
  );
  const collected = mapped.filter((x) => x.contents !== '');

  yield* Console.log('COLLECTED: ', collected);
  collected.forEach((x) => twin(`${x.contents}`));
  console.log('asdasdasd', sheetEntriesToCss(twin.target, true));

  yield* fs.writeFile(
    userConfig.outputCSS,
    new TextEncoder().encode(sheetEntriesToCss(twin.target, true)),
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
  ).pipe();

  // yield* $(
  //   Effect.gen(function* () {
  //     const file = yield* fs.open(userConfig.outputCSS, { flag: 'w+' });
  //     console.log('asdasdasd', sheetEntriesToCss(twin.target, true));
  //     yield* file.write(
  //       new TextEncoder().encode(JSON.stringify(sheetEntriesToCss(twin.target, true))),
  //     );
  //   }),
  //   Effect.scoped,
  //   Effect.catchAllCause((x) => Console.log(x)),
  // );

  // return {
  //   collectedClasses: pipe(collectedClasses, Chunk.toArray, RA.flatten),
  // };
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
