import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { TwinNodeContext, TwinNodeContextLive } from '../Config';
import { TwinFSContext, TwinFSContextLive, type TwinFile, TwinPath } from '../FileSystem';
import { listenForkedStreamChanges } from '../utils/effect.utils';
import { type TwinBabelModule, fromTwinFile } from './models/TwinBabelModule';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const fs = yield* TwinFSContext;
  const modulesRef = yield* SubscriptionRef.make(
    HashMap.empty<TwinPath.FilePath, TwinBabelModule>(),
  );

  const getModules = Ref.get(modulesRef);
  const findModule = (filepath: TwinPath.FilePath) =>
    Effect.map(modulesRef, HashMap.get(filepath));
  const addModule = (babelModule: TwinBabelModule) =>
    Ref.update(modulesRef, HashMap.set(babelModule.file.path, babelModule));
  const deleteModule = (filepath: TwinPath.FilePath) =>
    Effect.andThen(
      Ref.updateAndGet(modulesRef, HashMap.remove(filepath)),
      HashMap.has(filepath),
    );

  const watchModules = (
    onChange: (
      modules: HashMap.HashMap<TwinPath.FilePath, TwinBabelModule>,
    ) => Effect.Effect<void>,
  ) => listenForkedStreamChanges(modulesRef.changes, onChange);

  return {
    getBabelModule: (file: TwinFile) => fromTwinFile(file),
    updateModules,
    modules: {
      ref: modulesRef,
      get: getModules,
      find: findModule,
      delete: deleteModule,
      add: addModule,
      watch: watchModules,
    },
  };

  function updateModules() {
    return Effect.gen(function* () {
      const filePaths = yield* ctx.state.projectFiles.get.pipe(
        Effect.map(HashSet.map((x) => TwinPath.filePathFromString(x))),
      );
      yield* Effect.all(
        HashSet.map(filePaths, (_path) =>
          Effect.all([Effect.succeed(_path), moduleFromFilePath(_path)]),
        ),
        { concurrency: 'unbounded' },
      ).pipe(
        // Effect.map(HashSet.fromIterable),
        Effect.andThen((x) => SubscriptionRef.set(modulesRef, HashMap.fromIterable(x))),
        Effect.catchAll((error) => Effect.logDebug('ERROR_MODULES: ', error._tag)),
      );
    });
  }

  function moduleFromFilePath(path_: TwinPath.FilePath) {
    return fs.getFile(path_).pipe(
      Effect.andThen((file) => fromTwinFile(file)),
      Effect.tapError((error) => Effect.logDebug('ERROR_GETTING_MODULE: ', error._tag)),
    );
  }
});

export interface BabelContext extends Effect.Effect.Success<typeof make> {}
export const BabelContext = Context.GenericTag<BabelContext>('BabelContext');

export const BabelContextLive = Layer.effect(BabelContext, make).pipe(
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TwinFSContextLive),
);
