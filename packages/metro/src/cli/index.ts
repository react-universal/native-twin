import generator from '@babel/generator';
import { parse } from '@babel/parser';
import template from '@babel/template';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
// import { NodeStream } from '@effect/platform-node';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as FS from '@effect/platform/FileSystem';
import {
  Chunk,
  Console,
  MutableHashMap,
  MutableRef,
  Option,
  Queue,
  SubscriptionRef,
  Tuple,
} from 'effect';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import micromatch from 'micromatch';
import path from 'path';
// import { Transform } from 'stream';
import { RuntimeSheetEntry } from '@native-twin/css/jsx';
import { getBabelJSXElementParents } from '../compiler/Compiler.service';
import { createElementStyleSheet } from '../compiler/ts.compiler';
import { refreshTwinFile } from '../sheet/StyleSheet.service';
import { getElementEntries } from '../sheet/utils/styles.utils';
import { MetroConfigContext } from './MetroCli.service';
import { FileWatcherService, getFile } from './watcher.service';

const watcherProgram = Effect.gen(function* () {
  const ctx = yield* MetroConfigContext;
  const ref = yield* Ref.make<HashSet.HashSet<RuntimeSheetEntry>>(HashSet.empty());
  const watchFolders = ctx.twConfig.content
    .map((x) => path.join(ctx.projectRoot, x))
    .map((x) => micromatch.scan(x))
    .map((x) => x.base.replace(ctx.projectRoot, '.'));
  const watcherSvc = yield* FileWatcherService;

  const watcher = watcherSvc.register(watchFolders);
  yield* pipe(
    watcher,
    Stream.filter(
      (x) => x._tag === 'Create' && RegExp('\\.(ts|tsx|js|jsx)$', 'gm').test(x.path),
    ),
    // Stream.pipeThroughChannelOrFail(channel),
    Stream.runForEach((x) => {
      // console.log('XXX: ', x.path);
      return onFSFileEvent(x, ref);
    }),
  );
}).pipe(Effect.withSpan('WATCHER', { attributes: { foo: 'bar' } }));

const onFSFileEvent = (
  x: FS.WatchEvent,
  ref: Ref.Ref<HashSet.HashSet<RuntimeSheetEntry>>,
) =>
  Effect.gen(function* () {
    const ctx = yield* MetroConfigContext;
    return pipe(
      x,
      Effect.succeed,
      Effect.flatMap((x) =>
        pipe(
          getFile(x.path),
          Effect.map((y) =>
            parse(y, {
              plugins: ['jsx', 'typescript'],
              sourceType: 'module',
              errorRecovery: false,
              tokens: false,
              attachComment: true,
              sourceFilename: x.path,
            }),
          ),
          Effect.map((ast) => getBabelJSXElementParents(ast, x.path)),
          Effect.map((parents) =>
            pipe(
              createElementStyleSheet(parents, x.path),
              HashSet.flatMap((node) => {
                return pipe(node.runtimeData, (data) => {
                  const context = {
                    baseRem: ctx.twConfig.root.rem,
                    platform: ctx.platform ?? 'ios',
                  };
                  const propEntries = getElementEntries(data, ctx.twin, context);
                  return pipe(
                    propEntries,
                    RA.flatMap((x) => x.entries),
                    RA.dedupeWith((a, b) => a.className === b.className),
                  );
                });
              }),
            ),
          ),
          Effect.flatMap((incomingSet) => {
            return pipe(
              ref.get,
              Effect.map((current) => HashSet.union(current, incomingSet)),
              Effect.flatMap((x) => Ref.setAndGet(x)(ref)),
            );
          }),
          Effect.map((set) =>
            pipe(
              RA.fromIterable(set),
              RA.map((x) => x),
            ),
          ),
          // Effect.tap((x) => Console.log(x)),
        ),
      ),
      Effect.tap((x) =>
        Effect.promise(() => {
          return pipe(
            x,
            RA.dedupeWith((a, b) => a.className === b.className),
            (refreshed) => refreshTwinFile(ctx.twinCacheFile, refreshed),
          );
        }),
      ),
    );
  });

export const compilerRunnable = Effect.provide(
  watcherProgram,
  FileWatcherService.Live,
).pipe(
  Effect.withSpan('compiler', { attributes: { foo: 'bar' } }),
  Effect.provide(NodeFileSystem.layer),
);

export const makeWatcher = Effect.scoped(
  Effect.gen(function* () {
    const ctx = yield* MetroConfigContext;
    const fs = yield* FS.FileSystem;
    const queue = yield* Queue.unbounded<Chunk.Chunk<RuntimeSheetEntry>>();
    const latestEntries = yield* SubscriptionRef.make<any>(Option.none());
    const isAllowedPath = (filename: string) =>
      !micromatch.isMatch(path.resolve(ctx.projectRoot, filename), ctx.twConfig.content);

    const watchFolders = ctx.twConfig.content
      .map((x) => path.join(ctx.projectRoot, x))
      .map((x) => micromatch.scan(x))
      .map((x) => x.base);

    const watcherSvc = yield* FileWatcherService;
    const alreadyAdded = MutableHashMap.empty<string, RuntimeSheetEntry>();

    const file = yield* getFile(ctx.twinCacheFile);
    const parsed = MutableRef.make(
      parse(file, {
        plugins: ['jsx', 'typescript'],
        sourceType: 'module',
        errorRecovery: false,
        tokens: false,
        attachComment: true,
        sourceFilename: ctx.twinCacheFile,
      }),
    );

    yield* pipe(
      watcherSvc.register(watchFolders),
      Stream.filterEffect((file) =>
        fs.stat(file.path).pipe(
          Effect.map((x) => {
            return (
              x.type !== 'Directory' &&
              RegExp('\\.(ts|tsx|js|jsx)$', 'gm').test(file.path) &&
              isAllowedPath(path.join(ctx.projectRoot, file.path))
            );
          }),
        ),
      ),
      // Stream.tap((path) => Console.debug('PATH: ', path.path)),
      Stream.mapEffect((x) =>
        Effect.gen(function* () {
          // yield* Console.log('STATS: ', stats);
          const file = yield* getFile(x.path);
          const parsed = parse(file, {
            plugins: ['jsx', 'typescript'],
            sourceType: 'module',
            errorRecovery: false,
            tokens: false,
            attachComment: true,
            sourceFilename: x.path,
          });
          const parents = getBabelJSXElementParents(parsed, x.path);
          const sheet = pipe(
            createElementStyleSheet(parents, x.path),
            HashSet.flatMap((node) => {
              return pipe(node.runtimeData, (data) => {
                const context = {
                  baseRem: ctx.twConfig.root.rem,
                  platform: ctx.platform ?? 'ios',
                };
                const propEntries = getElementEntries(data, ctx.twin, context);
                return pipe(
                  propEntries,
                  RA.flatMap((x) => x.entries),
                  RA.map((entry) => Tuple.make(entry.className, entry)),
                );
              });
            }),
            // Record.fromEntries,
          );

          return sheet;
        }),
      ),
      Stream.runForEach((chunkEntries) =>
        Effect.gen(function* () {
          if (HashSet.size(chunkEntries) === 0) return;

          yield* Console.log('CHUNK_COUNT_BEFORE', HashSet.size(chunkEntries));
          const entries = HashSet.filter(
            chunkEntries,
            (x) => !MutableHashMap.has(alreadyAdded, x[0]),
          );
          yield* Console.log('AFTER_FILTER: ', HashSet.size(entries));

          // parsed.program.body[0].expression.right.arguments;
          traverse(MutableRef.get(parsed), {
            NewExpression(path) {
              const firstArg = path.node.arguments[0];
              if (!firstArg || !t.isArrayExpression(firstArg)) {
                path.stop();
                return;
              }
              HashSet.forEach(chunkEntries, (record) => {
                const alreadyHasIt = firstArg.elements.some((entry) => {
                  if (!t.isArrayExpression(entry)) return false;
                  return entry.elements.some(
                    (el) => t.isStringLiteral(el) && el.value === record[0],
                  );
                });
                if (alreadyHasIt) return;
                const entryRecord = template.ast(`${JSON.stringify(record)}`);
                if (Array.isArray(entryRecord)) return;
                if (
                  t.isExpressionStatement(entryRecord) &&
                  t.isArrayExpression(entryRecord.expression)
                ) {
                  MutableHashMap.set(alreadyAdded, record);
                  firstArg.elements.push(entryRecord.expression);
                }
              });
              path.traverse({ Identifier: () => void {} });
              path.resync();
            },
          });
          const result = generator(MutableRef.get(parsed));
          yield* fs.writeFile(ctx.twinCacheFile, Buffer.from(result.code, 'utf-8'));
          const newCode = yield* getFile(ctx.twinCacheFile);
          MutableRef.set(
            parsed,
            parse(newCode, {
              plugins: ['jsx', 'typescript'],
              sourceType: 'module',
              errorRecovery: false,
              tokens: false,
              attachComment: true,
              sourceFilename: ctx.twinCacheFile,
            }),
          );
        }),
      ),
      // Effect.forkScoped,
    );

    console.log('WATCHER_CONTINUES');

    return { queue, latestEntries };
  }),
).pipe(Effect.provide(FileWatcherService.Live), Effect.provide(NodeFileSystem.layer));

// Stream.flatMap(
//   (x) => Template.stream`new Map([
//   ${Effect.succeed('[')}
//   ${Stream.fromChunk(
//     x.pipe(
//       // asd
//       Schema.parseJson,
//       Chunk.Sc
//     ),
//   )}
//   ${Effect.succeed(']')}
//   ])`,
// ),
