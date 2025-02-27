import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { BabelContext, BabelContextLive, type TwinBabelModule } from '../Babel';
import { TwinNodeContext, TwinNodeContextLive } from '../Config';
import { TwinFSContext, TwinFSContextLive, TwinPath } from '../FileSystem';
import { ModulesHandler } from './models/ProjectModules';
import { TwinExtractor } from './models/TwinExtractor';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const fs = yield* TwinFSContext;
  const babel = yield* BabelContext;
  const modulesRef = yield* SubscriptionRef.make(
    HashMap.empty<TwinPath.FilePath, TwinBabelModule>(),
  );
  const twinExtractor = new TwinExtractor(ctx.state.twRunners.ref);
  const modulesHandler = new ModulesHandler(modulesRef);
  const projectRunner = modulesHandler.run(twinExtractor);

  yield* updateModules();

  return {
    moduleFromFilePath,
    modulesHandler,
    projectRunner,
    twinExtractor,
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
        {
          concurrency: 'unbounded',
        },
      ).pipe(
        Effect.map(HashSet.fromIterable),
        Effect.andThen((x) => SubscriptionRef.set(modulesRef, HashMap.fromIterable(x))),
        Effect.catchAll((error) => Effect.log('ERROR_MODULES: ', error._tag)),
      );
    });
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
