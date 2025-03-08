import type { TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as RcMap from 'effect/RcMap';
import * as Stream from 'effect/Stream';
import {
  BabelContext,
  BabelContextLive,
  type TwinBabelModule,
  type TwinJSXElement,
  type TwinJSXElementNode,
} from '../Babel';
import { TwinNodeContext, TwinNodeContextLive, type TwinRunnerPlatform } from '../Config';
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

  const modulesCache = yield* RcMap.make({
    lookup: (key: TwinPath.FilePath) => moduleFromFilePath(key),
    idleTimeToLive: Duration.hours(1),
  });

  const getModule = (filePath: TwinPath.FilePath) => RcMap.get(modulesCache, filePath);

  const getProjectModules = Stream.fromIterableEffect(ctx.state.projectFiles.get).pipe(
    Stream.mapEffect((x) => getModule(TwinPath.filePathFromString(x))),
  );

  const getTreeNodeDep = (treeNode: TreeNode<TwinJSXElementNode>) =>
    Effect.gen(function* () {
      const dependency = treeNode.value.dependency;

      if (Option.isNone(dependency)) return Option.none<TwinJSXElement>();
      const dependencyPath = yield* fs.getFullFilePathFromStr(dependency.value.filepath);
      const module = yield* getModule(dependencyPath);
      return dependency.pipe(Option.flatMap((dep) => module.findDependency(dep)));
    }).pipe(
      Effect.catchAll((error) =>
        Effect.log(`getTreeNodeDep Error: ${error.message}`).pipe(
          Effect.map(() => Option.none<TwinJSXElement>()),
        ),
      ),
      Effect.scoped,
    );

  return {
    sheet,
    getProjectModules,
    compileModule,
    getModule,
  };

  function compileModule(module: TwinBabelModule, platform: TwinRunnerPlatform) {
    return Effect.gen(function* () {
      const extractor = yield* sheet.extractor.getExtractor(platform);
      const compiledJSXElements = yield* Stream.fromIterable(module.jsxElements).pipe(
        Stream.mapEffect((jsxElement) => getCompiledJSXElement(jsxElement, extractor)),
        Stream.runCollect,
        Effect.map(RA.fromIterable),
      );
      return new CompiledTwinBabelModule(module, compiledJSXElements);
    });
  }

  function getCompiledJSXElement(
    jsxElement: TwinJSXElement,
    compiler: CompilerStyleSheet,
  ) {
    return Effect.gen(function* () {
      const compiledTree = yield* mapTreeEffect(jsxElement.tree, (treeNode) =>
        Effect.gen(function* () {
          const original = yield* getTreeNodeDep(treeNode);
          const styledProps = treeNode.value.getStyledProps(compiler);
          return new CompiledTwinJSXElementNode(treeNode.value, styledProps, original);
        }),
      );
      return new CompiledTwinJSXElement(jsxElement, compiledTree);
    });
  }
});

export interface TwinProjectContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectContext =
  Context.GenericTag<TwinProjectContext>('TwinProjectContext');

export const TwinProjectContextLive = Layer.scoped(TwinProjectContext, make).pipe(
  Layer.provide(TwinStyleSheetContextLive),
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TwinFSContextLive),
  Layer.provide(BabelContextLive),
);
