import generate from '@babel/generator';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
// import * as Record from 'effect/Record';
// import * as Sink from 'effect/Sink';
import * as Stream from 'effect/Stream';
import type { __Theme__ } from '@native-twin/core';
import {
  applyParentEntries,
  getChildRuntimeEntries,
  getRawSheet,
} from '@native-twin/css/jsx';
import { TreeNode } from '@native-twin/helpers/tree';
import {
  addTwinPropsToElement,
  BabelJSXElementNode,
  CompiledTree,
  createBabelAST,
  getAstTrees,
  getElementEntries,
  JSXElementTree,
} from '../../jsx-babel';
import { BabelTransformerService, MetroCompilerContext } from '../services';
import { NativeTwinService } from '../services/NativeTwin.service';

export const babelTraverseCode = (code: string) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroCompilerContext;
    yield* BabelTransformerService;
    const ast = createBabelAST(code);
    const trees = yield* pipe(
      Stream.fromIterableEffect(getAstTrees(ast)),
      Stream.mapEffect((x) => extractSheetsFromTree(x.root)),
      Stream.map(HashMap.fromIterable),
      // Stream.runCollect,
      Stream.runFold(HashMap.empty<string, CompiledTree>(), (prev, current) => {
        return pipe(prev, HashMap.union(current));
      }),
      Effect.map((sheet) => {
        return pipe(
          sheet,
          HashMap.map((leave) => {
            const parentLeave = pipe(
              Option.fromNullable(leave.parentID),
              Option.flatMap((x) => HashMap.get(sheet, x)),
            );
            const runtimeSheet = pipe(
              parentLeave,
              Option.map((parent) =>
                applyParentEntries(
                  leave.compiled.entries,
                  parent.compiled.childEntries,
                  leave.order,
                  leave.parentSize,
                ),
              ),
              Option.getOrElse(() => leave.compiled.entries),
            );
            addTwinPropsToElement(leave.compiled.node, runtimeSheet, ctx.generate);
            return {
              leave,
              runtimeSheet,
            };
          }),
        );
      }),
    );
    // pipe(
    //   yield* pipe(
    //     trees,
    //     RA.map((tree) => extractSheetsFromTree(tree.root)),
    //     Effect.all,
    //   ),
    //   RA.reduce(HashMap.empty<string, CompiledTree>(), (prev, current) =>
    //     pipe(prev, HashMap.union(current)),
    //   ),
    // );

    // pipe(
    //   sheet,
    //   HashMap.forEach((leave) => {
    //     const runtimeSheet = pipe(
    //       Option.fromNullable(leave.)
    //     )
    //     addTwinPropsToElement(leave.node, leave.entries, ctx.generate);
    //   }),
    // );

    return {
      trees,
      generated: pipe(
        Option.fromNullable(generate(ast)),
        Option.map((x) => x.code),
        Option.getOrElse(() => code),
      ),
    };
  });
};

function extractSheetsFromTree(tree: TreeNode<JSXElementTree>) {
  return Effect.gen(function* () {
    // const fileSheet = MutableHashMap.empty<string, CompiledTree>();
    const ctx = yield* MetroCompilerContext;
    const twin = yield* NativeTwinService;
    const fileSheet = RA.empty<[string, CompiledTree]>();

    tree.traverse(({ value, parent }) => {
      const model = new BabelJSXElementNode(value.path.node, value.order, ctx.filename);
      const entries = pipe(getElementEntries(model.runtimeData, twin.tw, twin.context));
      const childEntries = pipe(entries, getChildRuntimeEntries);

      const compiled: CompiledTree = {
        compiled: {
          childEntries,
          entries: pipe(entries, getRawSheet),
          node: model,
        },
        parentID: value.parentID,
        path: value.path,
        source: value.source,
        parentSize: parent?.childrenCount ?? -1,
        order: value.order,
        uid: value.uid,
      };
      fileSheet.push([compiled.uid, compiled]);
      // pipe(fileSheet, MutableHashMap.set(value.uid, compiled));
    }, 'breadthFirst');

    // return HashMap.fromIterable(fileSheet);
    return fileSheet;
  });
}
