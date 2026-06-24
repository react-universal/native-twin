import type { CompiledSheetEntry } from '@native-twin/core';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Stream from 'effect/Stream';
import type { TwinRunnerPlatform } from './Config/Models';
import { TwinNodeContext } from './Config/Service';
import type {
  TwinJSXElement,
  TwinJSXElementNode,
  TwinModuleAst,
} from './internal/babel/babel.models';
import { TransformedJSXNode } from './Project/Model';
import type { CompilerStyleSheet } from './StyleSheet';
import { mapTreeEffect } from './utils/tree.utils';

export const compileAst = Effect.fn(function* (
  twinAst: TwinModuleAst,
  platform: TwinRunnerPlatform,
) {
  const ctx = TwinNodeContext.Service;

  const extractor = yield* ctx.getTwForPlatform(platform);

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
