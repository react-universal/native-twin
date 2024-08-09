import { parse } from '@babel/parser';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import micromatch from 'micromatch';
import path from 'path';
import { RuntimeSheetEntry } from '@native-twin/css/jsx';
import { getBabelJSXElementParents } from '../compiler/compiler.service';
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
      console.log('XXX: ', x.path);
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
    }),
  );
});

export const compilerRunnable = Effect.provide(
  watcherProgram,
  FileWatcherService.Live,
).pipe(Effect.provide(NodeFileSystem.layer));
