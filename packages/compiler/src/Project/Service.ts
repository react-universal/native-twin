import type { CompiledSheetEntry } from '@native-twin/core';
import type { TreeNode } from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type { TwinJSXElement, TwinJSXElementNode, TwinModuleAst } from '../Babel';
import { BabelUtils } from '../Babel';
import { TwinNodeContext, type TwinRunnerPlatform } from '../Config';
import { TwinFSContext, TwinPath } from '../FileSystem';
import { type CompilerStyleSheet, TwinStyleSheetContext } from '../StyleSheet';
import { mapTreeEffect } from '../utils/tree.utils';
import { TransformedJSXNode } from './Model';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const fs = yield* TwinFSContext;
  const sheet = yield* TwinStyleSheetContext;

  const getProjectModules = Stream.fromIterableEffect(ctx.state.projectFiles.get).pipe(
    Stream.mapEffect((x) => BabelUtils.getTwinModuleAstFromPath(TwinPath.filePathFromString(x))),
  );

  const compileAst = Effect.fn(function* (twinAst: TwinModuleAst, platform: TwinRunnerPlatform) {
    const extractor = yield* ctx.state.twRunners.get.pipe(
      Effect.map(({ native, web }) => (platform === 'web' ? web : native)),
    );
    const moduleTrees = yield* Stream.fromIterable(twinAst.jsxElements).pipe(
      Stream.mapEffect((element) => transformJSXElement(element, extractor)),
      Stream.flatMap((tree) => Stream.fromIterable(tree.all())),
      Stream.runCollect,
      Effect.map(RA.fromIterable),
    );

    return moduleTrees;
  });

  const transformJSXElement = Effect.fn(function* (
    jsxElement: TwinJSXElement,
    extractor: CompilerStyleSheet,
  ) {
    const mappedTree = yield* mapTreeEffect<TwinJSXElementNode, TransformedJSXNode>(
      jsxElement.tree,
      (treeNode, parent) =>
        Effect.gen(function* () {
          const styledProps = extractor.getStyledProps(treeNode.value);
          let parentStyles: CompiledSheetEntry[] = [];
          const treeNodeParent = treeNode.parent;

          if (parent && treeNodeParent) {
            parentStyles = parent.value.styledProps.flatMap((x) =>
              x.getChildStyles(treeNode.nodeIndex, treeNodeParent.childrenCount),
            );
          }
          const transform = new TransformedJSXNode({
            jsxDeclarator: jsxElement,
            parentID: treeNode.parent?.value.id ?? null,
            node: treeNode,
            styledProps,
            parentStyles,
            index: treeNode.nodeIndex,
            parentSize: treeNode.parent?.childrenCount ?? -1,
          });
          return transform;
        }),
    );

    return mappedTree;
  });

  const getAst = (filename: string, code: string) =>
    Effect.andThen(fs.getFile(filename, code), BabelUtils.getTwinFileAst);

  const getFiles = ctx.state.projectFiles.get;

  return {
    getProjectModules,
    sheet,
    getFiles,
    compileAst,
    getAst,
    getTreeNodeDep,
  };

  function getTreeNodeDep(treeNode: TreeNode<TwinJSXElementNode>) {
    const dependency = treeNode.value.dependency;

    if (Option.isNone(dependency)) return Effect.succeed(Option.none<TwinJSXElement>());

    return Effect.andThen(fs.getFullFilePathFromStr(dependency.value.filepath), (dependencyPath) =>
      BabelUtils.getTwinModuleAstFromPath(dependencyPath),
    ).pipe(
      Effect.map((module) => dependency.pipe(Option.flatMap((dep) => module.findDependency(dep)))),
      Effect.catchAll((error) =>
        Effect.log(`getTreeNodeDep Error: ${error.message}`).pipe(
          Effect.map(() => Option.none<TwinJSXElement>()),
        ),
      ),
    );
  }
});

export interface TwinProjectContext extends Effect.Effect.Success<typeof make> {}
export const TwinProjectContext = Context.GenericTag<TwinProjectContext>('TwinProjectContext');

export const TwinProjectContextLive = Layer.effect(TwinProjectContext, make);
