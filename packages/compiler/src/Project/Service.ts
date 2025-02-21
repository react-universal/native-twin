import * as Tree from '@native-twin/helpers/tree';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { identity } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Sink from 'effect/Sink';
import * as Stream from 'effect/Stream';
import { type BabelModule, type ModuleDependency, makeBabelModule } from '../Babel';
import { CompilerConfigContext, TwinNodeContext, TwinNodeContextLive } from '../Config';
import { TwinPath } from '../FileSystem';
import { FSUtils } from '../internal/fs';
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

  function findModuleByDependency(dependency: ModuleDependency) {
    return Effect.gen(function* () {
      const dependencyPath = dependency.filepath;
      const modules = yield* getProjectModules;
      const maybeModule = HashMap.findFirst(modules, (mod, key) =>
        key.startsWith(dependencyPath),
      ).pipe(Option.getOrNull);

      if (!maybeModule) return null;

      const [_, module] = maybeModule;
      const maybeDomElement = yield* module.domElements.pipe(
        Stream.find((x) => x.name === dependency.exportName),
        Stream.runHead,
        Effect.map(Option.getOrNull),
      );
      return maybeDomElement;
    });
  }

  function runTransform(module: BabelModule, runner: TwinProjectRunner) {
    return Effect.gen(function* () {
      const sheet = new TwinModuleSheet(module);
      yield* module.domElements.pipe(
        Stream.map((x) => {
          return x;
        }),
        Stream.runForEach((domNode) =>
          Effect.gen(function* () {
            const sheetTree = Tree.mapTree(
              domNode.tree,
              (domElement) =>
                new TwinDomElementSheet(
                  domElement,
                  module.findDomElementDependency(domElement.value),
                  runner,
                ),
            );
            return sheet.registerDomTree(domNode.name, sheetTree);
          }),
        ),
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
