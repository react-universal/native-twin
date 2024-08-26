import generate from '@babel/generator';
import { HashMap, MutableHashMap, Record } from 'effect';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { identity, pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type { __Theme__ } from '@native-twin/core';
import {
  applyParentEntries,
  getChildRuntimeEntries,
  RuntimeComponentEntry,
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

export const babelTraverseCode = (code: string) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroCompilerContext;
    const transformer = yield* BabelTransformerService;
    const ast = createBabelAST(code);
    const trees = yield* getAstTrees(ast);

    const sheet = pipe(
      yield* pipe(
        trees,
        RA.map((tree) => extractSheetsFromTree(tree.root)),
        Effect.all,
      ),
      RA.reduce(HashMap.empty<string, CompiledTree>(), (prev, current) =>
        pipe(prev, HashMap.union(current)),
      ),
    );

    const compiledTrees = pipe(
      trees,
      RA.map((tree) => {
        const mapped = tree.map<CompiledTree>(transformer.compileTreeNode);
        // pipe(mapped.traverse(transformCompiledNode, 'breadthFirst'));
        return mapped;
      }),
      RA.map((tree) => {
        tree.traverse((leave) => {
          const runtimeSheet = pipe(
            Option.fromNullable(leave.parent),
            Option.flatMap((parent) =>
              pipe(
                HashMap.get(sheet, parent.value.uid),
                Option.map((sheet) => ({
                  leave: parent,
                  sheet,
                })),
              ),
            ),
            Option.zipWith(
              HashMap.get(sheet, leave.value.uid),
              (parent, currentSheet) => {
                return pipe(currentSheet.entries, RA.map(identity), (x) =>
                  applyParentEntries(
                    x,
                    pipe({ ...parent.sheet.childEntries }, Record.map(identity)),
                    currentSheet.order,
                    parent.leave.childrenCount,
                  ),
                );
              },
            ),
            Option.getOrElse(() =>
              pipe(
                sheet,
                HashMap.get(leave.value.uid),
                Option.map((x) => x.entries),
                Option.getOrElse((): RuntimeComponentEntry[] => []),
              ),
            ),
          );
          addTwinPropsToElement(leave.value.node, runtimeSheet, ctx.generate);
        }, 'breadthFirst');
        return tree;
      }),
    );

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
      sheet,
      compiledTrees,
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
    const fileSheet = MutableHashMap.empty<string, CompiledTree>();
    const ctx = yield* MetroCompilerContext;

    tree.traverse(({ value, children, childrenCount }) => {
      const model = new BabelJSXElementNode(value.path.node, value.order, ctx.filename);
      const entries = getElementEntries(model.runtimeData, ctx.twin, ctx.twinCtx);
      const childEntries = pipe(entries, getChildRuntimeEntries);

      const compiled: CompiledTree = {
        childEntries,
        entries,
        inheritedEntries: null,
        node: model,
        order: value.order,
        uid: value.uid,
      };
      pipe(fileSheet, MutableHashMap.set(value.uid, compiled));
    }, 'breadthFirst');

    return HashMap.fromIterable(fileSheet);
  });
}
