import * as Tree from '@native-twin/helpers/tree';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { identity } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import * as Sink from 'effect/Sink';
import * as Stream from 'effect/Stream';
import { type BabelModule, makeBabelModule } from '../Babel';
import * as TwinPath from '../FileSystem/Path.model';
import { FSUtils } from '../internal/fs';
import { CompilerConfigContext } from '../services/CompilerConfig.service';
import {
  TwinNodeContext,
  TwinNodeContextLive,
} from '../services/TwinNodeContext.service';
import { TwinDomElementSheet, TwinModuleSheet, TwinProjectRunner } from './Model';

const make = Effect.gen(function* () {
  const env = yield* CompilerConfigContext;
  const ctx = yield* TwinNodeContext;
  const fs = yield* FSUtils.FsUtils;
  const twinRunners = yield* ctx.state.twRunners.get;
  const nativeRunner = yield* Ref.make(new TwinProjectRunner(twinRunners.native));
  const webRunner = yield* Ref.make(new TwinProjectRunner(twinRunners.web));
  const projectModules = yield* Ref.make(HashMap.empty<TwinPath.FilePath, BabelModule>());

  const _getProjectModules = Stream.fromIterableEffect(ctx.state.projectFiles.get).pipe(
    Stream.map((path_) => TwinPath.filePathFromString(path_, env.projectRoot)),
    Stream.mapEffect(moduleFromFilePath),
    Stream.run(Sink.collectAllToMap((module) => module.filepath, identity)),
    // Effect.tap((mods) => Ref.set(projectModules, mods)),
  );
  yield* refreshModules();

  const getProjectModules = Ref.get(projectModules);

  return {
    getProjectModules,
    nativeRunner,
    webRunner,
    moduleFromFilePath,
    refreshModules,
    runTransform,
  };

  function moduleFromFilePath(path_: TwinPath.FilePath) {
    return Effect.map(fs.readFile(path_), (code) => makeBabelModule(path_, code));
  }

  function refreshModules() {
    return _getProjectModules.pipe(
      Effect.andThen((mods) => Ref.set(projectModules, mods)),
    );
  }

  function runTransform(module: BabelModule, runner: TwinProjectRunner) {
    return Effect.gen(function* () {
      const sheet = new TwinModuleSheet(module);
      yield* Stream.runForEach(module.domElements, (domNode) =>
        Effect.sync(() => {
          const sheetTree = Tree.mapTree(
            domNode.tree,
            (domElement) => new TwinDomElementSheet(domElement, runner),
          );
          return sheet.registerDomTree(domNode.name, sheetTree);
        }),
      );
      return sheet;
    });
  }
});

export interface TwinProjectContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectContext =
  Context.GenericTag<TwinProjectContext>('TwinProjectContext');

export const TwinProjectContextLive = Layer.effect(TwinProjectContext, make).pipe(
  Layer.provide(FSUtils.FsUtilsLive),
  Layer.provide(TwinNodeContextLive),
);
