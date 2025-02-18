import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import madge from 'madge';
import { resolveDeclarator } from '../Compiler/Utils';
import type { TwinFileResult } from '../FileSystem/Models';
import { TwinFSContext, TwinFSContextLive } from '../FileSystem/Service';
import { FSUtils, TwinPath } from '../internal/fs';
import {
  TwinNodeContext,
  TwinNodeContextLive,
} from '../services/TwinNodeContext.service';
import { babelParse } from '../utils/babel/babel.parser';
import { funcJSXElementFunction } from '../utils/babel/babel.utils';
import { ModuleComponent, ResolvedModule } from './Models';
import { getJSXTree, getRootJSXElements, isLocalImport } from './Utils';

const make = Effect.gen(function* () {
  const path = yield* TwinPath.TwinPath;
  const ctx = yield* TwinNodeContext;
  const twinFS = yield* TwinFSContext;
  const cachedModules = yield* Ref.make(HashMap.empty<TwinFileResult, ResolvedModule>());

  const getCachedFile = (input: TwinFileResult) =>
    Ref.get(cachedModules).pipe(Effect.map((cache) => HashMap.get(cache, input)));

  const setCachedFile = (input: TwinFileResult, resolved: ResolvedModule) =>
    Ref.update(cachedModules, (cache) => HashMap.set(cache, input, resolved));

  const madgeObj = yield* getProjectDependencyGraph();
  console.log('DEPS: ', madgeObj);
  return {
    resolveFile,
    resolveProjectModules,
    resolveBindingsForScope,
    resolveImportPath,
  };

  function resolveFile(filename: string, contents?: string) {
    return Effect.gen(function* () {
      const file = yield* twinFS.getFile(filename, contents);
      const cached = yield* getCachedFile(file);
      if (Option.isSome(cached)) return cached.value;

      const ast = babelParse(file.content, file.filename);
      const components = yield* getRootJSXElements(ast).pipe(
        Stream.filterMap((babelPath) => {
          const def = funcJSXElementFunction(babelPath);
          if (!def) return Option.none();
          const declarator = resolveDeclarator(def);
          const tree = getJSXTree(babelPath, (importSource) =>
            resolveImportPath(file.filename, importSource),
          );
          return Option.some(new ModuleComponent(babelPath, declarator, tree));
        }),
        Stream.runCollect,
        Effect.map(RA.fromIterable),
      );

      const module = new ResolvedModule(file.filename, file.content, ast, components);

      yield* setCachedFile(file, module);
      return module;
    });
  }

  function resolveProjectModules() {
    return ctx.state.projectFiles.get.pipe(
      Effect.andThen((files) =>
        Effect.all(HashSet.map(files, (filename) => resolveFile(filename))),
      ),
    );
  }

  function getProjectDependencyGraph() {
    return ctx.state.projectFiles.get.pipe(
      Effect.andThen((files) =>
        Effect.promise(() =>
          madge(RA.fromIterable(files), {
            // baseDir: env.projectRoot,

            detectiveOptions: {
              ts: {
                skipTypeImports: true,
              },
            },
          }),
        ),
      ),
    );
  }

  function resolveBindingsForScope(
    scope: NodePath<t.JSXElement>['scope'],
    filename: string,
  ) {
    const program = scope.getProgramParent().block as t.Program;

    return resolveDependencies(program, filename);
  }

  function resolveDependencies(program: t.Program, filename: string) {
    return Stream.fromIterable(program.body).pipe(
      Stream.filterMap(Option.liftPredicate((node) => t.isImportDeclaration(node))),
      Stream.filter((node) => isLocalImport(node.source.value)),
      Stream.map((node) => resolveImportPath(filename, node.source.value)),
      Stream.mapEffect((depPath) => twinFS.getFullFilePathFromStr(depPath)),
      Stream.tap((x) => Effect.logDebug('dep_path', x)),
      Stream.filterEffect((depPath) => ctx.isAllowedPath(depPath)),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
    );
  }

  function resolveImportPath(sourcePath: string, targetPath: string) {
    const sourceDir = path.dirname(sourcePath);
    if (isLocalImport(targetPath)) {
      if (path.extname(targetPath) === '') {
        targetPath += '';
      }
      return path.resolve(sourceDir, targetPath);
    }

    return targetPath;
  }
});

export interface TwinResolverContext extends Effect.Effect.Success<typeof make> {}
export const TwinResolverContext =
  Context.GenericTag<TwinResolverContext>('TwinResolverContext');

export const TwinResolverContextLive = Layer.effect(TwinResolverContext, make).pipe(
  Layer.provide(FSUtils.FsUtilsLive),
  Layer.provide(TwinPath.TwinPathLive),
  Layer.provide(TwinFSContextLive),
  Layer.provide(TwinNodeContextLive),
);
