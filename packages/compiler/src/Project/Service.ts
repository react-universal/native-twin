import type { TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
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
  const { moduleFromFilePath, moduleFromFile } = yield* BabelContext;
  const sheet = yield* TwinStyleSheetContext;

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

  const getModule = (filename: string, code: string) =>
    Effect.andThen(fs.getFile(filename, code), moduleFromFile);

  const getProjectModules = Stream.fromIterableEffect(ctx.state.projectFiles.get).pipe(
    Stream.mapEffect((x) => moduleFromFilePath(TwinPath.filePathFromString(x))),
  );

  return {
    sheet,
    getProjectModules,
    compileModule,
    moduleFromFilePath,
    getModule,
    getTreeNodeDep,
  };

  function getCompiledJSXElement(
    jsxElement: TwinJSXElement,
    compiler: CompilerStyleSheet,
  ) {
    return Effect.map(
      mapTreeEffect(jsxElement.tree, (treeNode) =>
        Effect.map(
          getTreeNodeDep(treeNode),
          (original) =>
            new CompiledTwinJSXElementNode(
              treeNode.value,
              compiler.getStyledProps(treeNode.value),
              compiler,
              original,
            ),
        ),
      ),
      (tree) => new CompiledTwinJSXElement(jsxElement, tree),
    );
  }

  function getTreeNodeDep(treeNode: TreeNode<TwinJSXElementNode>) {
    const dependency = treeNode.value.dependency;

    if (Option.isNone(dependency)) return Effect.succeed(Option.none<TwinJSXElement>());

    return Effect.andThen(
      fs.getFullFilePathFromStr(dependency.value.filepath),
      (dependencyPath) => moduleFromFilePath(dependencyPath),
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
