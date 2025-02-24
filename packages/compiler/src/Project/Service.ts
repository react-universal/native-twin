import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { BabelContext, BabelContextLive, type TwinBabelModule } from '../Babel';
import { TwinNodeContext, TwinNodeContextLive } from '../Config';
import { TwinFSContext, TwinFSContextLive, TwinPath } from '../FileSystem';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const fs = yield* TwinFSContext;
  const babel = yield* BabelContext;
  const modulesRef = yield* SubscriptionRef.make(HashSet.empty<TwinBabelModule>());

  const updateModules = Effect.gen(function* () {
    const filePaths = yield* ctx.state.projectFiles.get.pipe(
      Effect.map(HashSet.map((x) => TwinPath.filePathFromString(x))),
    );
    yield* Effect.all(HashSet.map(filePaths, moduleFromFilePath), {
      concurrency: 'unbounded',
    }).pipe(
      Effect.map(HashSet.fromIterable),
      Effect.andThen((x) => SubscriptionRef.set(modulesRef, x)),
      Effect.catchAll((error) => Effect.log('ERROR_MODULES: ', error._tag)),
    );
  });

  const watchModules = ctx.state.projectFiles.changes.pipe(
    Stream.tap(() => updateModules),
    Stream.mapEffect(() => getCurrentModules()),
  );

  yield* updateModules;

  return {
    modulesRef,
    moduleFromFilePath,
    getCurrentModules,
    watchModules,
  };

  function getCurrentModules() {
    return Ref.get(modulesRef).pipe(
      Effect.andThen((currentMods) =>
        Effect.if(HashSet.size(currentMods) > 0, {
          onTrue: () => Effect.succeed(currentMods),
          onFalse: () => updateModules.pipe(Effect.andThen(() => Ref.get(modulesRef))),
        }),
      ),
    );
  }

  function moduleFromFilePath(path_: TwinPath.FilePath) {
    return fs.getFile(path_).pipe(
      Effect.andThen((file) => babel.getBabelModule(file)),
      Effect.tapError((error) => Effect.log('ERROR_GETTING_MODULE: ', error._tag)),
    );
  }
});

export interface TwinProjectContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectContext =
  Context.GenericTag<TwinProjectContext>('TwinProjectContext');

export const TwinProjectContextLive = Layer.effect(TwinProjectContext, make).pipe(
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TwinFSContextLive),
  Layer.provide(BabelContextLive),
);
