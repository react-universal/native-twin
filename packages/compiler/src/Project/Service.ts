import { Stream } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Ref from 'effect/Ref';
import madge from 'madge';
import type * as TwinPath from '../FileSystem/Path.model';
import { FSUtils } from '../internal/fs';
import { CompilerConfigContext } from '../services/CompilerConfig.service';
import * as Models from './Models';

const make = Effect.gen(function* () {
  const env = yield* CompilerConfigContext;
  const fs = yield* FSUtils.FsUtils;
  const projectModules = yield* Ref.make(
    HashMap.empty<TwinPath.FilePath, Models.ProjectModule>(),
  );

  const getProjectModules = Ref.get(projectModules);
  const getModule = (filename: TwinPath.FilePath) =>
    Effect.map(getProjectModules, (mods) => HashMap.get(mods, filename));
  const addModule = (module: Models.ProjectModule) =>
    Ref.update(projectModules, (mods) => HashMap.set(mods, module.filepath, module));

  const getDependencyGraph = Effect.andThen(getProjectModules, (files) =>
    getGraphFrom(HashMap.keys(files), env.projectRoot),
  );

  return {
    getProjectModules,
    getDependencyGraph,
    getModule,
    addModule,
    moduleFromFilePath,
    createProjectModules,
  };

  function moduleFromFilePath(path_: TwinPath.FilePath) {
    return Effect.map(
      fs.readFile(path_),
      (code) => new Models.ProjectModule(path_, code),
    );
  }

  function createProjectModules(paths_: Iterable<TwinPath.FilePath>) {
    return Stream.fromIterable(paths_).pipe(Stream.mapEffect(moduleFromFilePath));
  }
});

export interface TwinProjectContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectContext =
  Context.GenericTag<TwinProjectContext>('TwinProjectContext');

export const TwinProjectContextLive = Layer.effect(TwinProjectContext, make).pipe(
  Layer.provide(FSUtils.FsUtilsLive),
);

const getGraphFrom = (files: Iterable<TwinPath.FilePath>, rootDir: string) =>
  Effect.promise(() =>
    madge(files, {
      baseDir: rootDir,
      detectiveOptions: {
        ts: {
          skipTypeImports: true,
        },
      },
    }),
  );
