// import type { CompiledSheetEntry } from '@native-twin/core';
// import * as RA from 'effect/Array';
// import * as Effect from 'effect/Effect';
// import * as Stream from 'effect/Stream';
// import { BabelUtils } from './Babel';
// import { getJSXElementNodeId } from './internal/babel';
// import type {
//   TwinJSXElement,
//   TwinJSXElementNode,
//   TwinModuleAst,
// } from './internal/babel/babel.models';
// import type { TwinRunnerPlatform } from './internal/twinNode';
// import { TwinNodeContext } from './internal/twinNode';
// import { TransformedJSXNode } from './Project/Model';
// import type { CompilerStyleSheet } from './StyleSheet/Model';
// import { mapTreeEffect } from './utils/tree.utils';

// export const createRunner = Effect.fnUntraced(function* (
//   filepath: string,
//   code: string,
//   platform: string,
// ) {
//   const ast = yield* BabelUtils.babelParse(code, filepath);
//   const ctx = TwinNodeContext.Service;
//   const extractor = yield* ctx.getTwForPlatform(platform);
// });

// export const compileAst = Effect.fn(function* (
//   twinAst: TwinModuleAst,
//   platform: TwinRunnerPlatform,
// ) {
//   const ctx = TwinNodeContext.Service;

//   const extractor = yield* ctx.getTwForPlatform(platform);

//   const moduleTrees = yield* Stream.fromIterable(twinAst.jsxElements).pipe(
//     Stream.mapEffect((element) => transformJSXElement(element, extractor)),
//     Stream.flatMap((tree) => Stream.fromIterable(tree.all())),
//     Stream.runCollect,
//     Effect.map(RA.fromIterable),
//   );

//   return moduleTrees;
// });

// const transformJSXElement = Effect.fn(function* (
//   jsxElement: TwinJSXElement,
//   extractor: CompilerStyleSheet,
// ) {
//   const mappedTree = yield* mapTreeEffect<TwinJSXElementNode, TransformedJSXNode>(
//     jsxElement.tree,
//     (treeNode, parent) =>
//       Effect.gen(function* () {
//         const styledProps = extractor.getStyledProps(treeNode.value);
//         let parentStyles: CompiledSheetEntry[] = [];
//         const treeNodeParent = treeNode.parent;

//         if (parent && treeNodeParent) {
//           parentStyles = parent.value.styledProps.flatMap((x) =>
//             x.getChildStyles(treeNode.nodeIndex, treeNodeParent.childrenCount),
//           );
//         }
//         const transform = new TransformedJSXNode({
//           jsxDeclarator: jsxElement,
//           parentID: treeNode.parent ? getJSXElementNodeId(treeNode.parent.value) : null,
//           node: treeNode,
//           styledProps,
//           parentStyles,
//           index: treeNode.nodeIndex,
//           parentSize: treeNode.parent?.childrenCount ?? -1,
//         });
//         return transform;
//       }),
//   );

//   return mappedTree;
// });

export { twinTransformProgram } from './Programs/twinTransform.program';
