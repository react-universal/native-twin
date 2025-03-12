import type { TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Cache from 'effect/Cache';
import * as Context from 'effect/Context';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { BabelContext, BabelContextLive } from '../Babel';
import { TwinNodeContext, TwinNodeContextLive, type TwinRunnerPlatform } from '../Config';
import type { TwinBabelModule } from '../Domain/TwinBabelModule';
import type { TwinJSXElement } from '../Domain/TwinJSXElement';
import type { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';
import { TwinFSContext, TwinFSContextLive, TwinPath } from '../FileSystem';
import {
  type CompilerStyleSheet,
  TwinStyleSheetContext,
  TwinStyleSheetContextLive,
} from '../StyleSheet';
import { mapTreeEffect } from '../utils/tree.utils';
import {
  CompiledTwinBabelModule,
  CompiledTwinJSXElement,
  CompiledTwinJSXElementNode,
} from './Model';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const fs = yield* TwinFSContext;
  const { moduleFromFilePath } = yield* BabelContext;
  const sheet = yield* TwinStyleSheetContext;

  const modulesCache = yield* Cache.make({
    lookup: (key: TwinPath.FilePath) => moduleFromFilePath(key),
    timeToLive: Duration.hours(1),
    capacity: Number.MAX_SAFE_INTEGER,
  });

  const getModule = (filePath: TwinPath.FilePath) => modulesCache.get(filePath);

  const compileModule = (module: TwinBabelModule, platform: TwinRunnerPlatform) =>
    Effect.gen(function* () {
      const extractor = yield* sheet.extractor.getExtractor(platform);
      const compiledJSXElements = yield* Stream.fromIterable(module.jsxElements).pipe(
        Stream.mapEffect((jsxElement) => getCompiledJSXElement(jsxElement, extractor)),
        Stream.runCollect,
        Effect.map(RA.fromIterable),
      );
      return new CompiledTwinBabelModule(module, compiledJSXElements);
    });

  const getProjectModules = Stream.fromIterableEffect(ctx.state.projectFiles.get).pipe(
    Stream.mapEffect((x) => getModule(TwinPath.filePathFromString(x))),
  );

  return {
    sheet,
    getProjectModules,
    compileModule,
    getModule,
  };

  function getCompiledJSXElement(
    jsxElement: TwinJSXElement,
    compiler: CompilerStyleSheet,
  ) {
    return Effect.gen(function* () {
      const compiledTree = yield* mapTreeEffect(jsxElement.tree, (treeNode) =>
        Effect.gen(function* () {
          const original = yield* getTreeNodeDep(treeNode);
          const styledProps = compiler.getStyledProps(treeNode.value);
          return new CompiledTwinJSXElementNode(
            treeNode.value,
            styledProps,
            compiler,
            original,
          );
        }),
      );
      return new CompiledTwinJSXElement(jsxElement, compiledTree);
    });
  }

  function getTreeNodeDep(treeNode: TreeNode<TwinJSXElementNode>) {
    const dependency = treeNode.value.dependency;

    if (Option.isNone(dependency)) return Effect.succeed(Option.none<TwinJSXElement>());

    return Effect.andThen(
      fs.getFullFilePathFromStr(dependency.value.filepath),
      (dependencyPath) => getModule(dependencyPath),
    ).pipe(
      Effect.map((module) =>
        dependency.pipe(Option.flatMap((dep) => module.findDependency(dep))),
      ),
      Effect.catchAll((error) =>
        Effect.log(`getTreeNodeDep Error: ${error.message}`).pipe(
          Effect.map(() => Option.none<TwinJSXElement>()),
        ),
      ),
    );
  }
});

export interface TwinProjectContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectContext =
  Context.GenericTag<TwinProjectContext>('TwinProjectContext');

export const TwinProjectContextLive = Layer.effect(TwinProjectContext, make).pipe(
  Layer.provide(TwinStyleSheetContextLive),
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TwinFSContextLive),
  Layer.provide(BabelContextLive),
);
