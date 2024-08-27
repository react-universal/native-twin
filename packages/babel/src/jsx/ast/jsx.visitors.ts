import generate from '@babel/generator';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type { __Theme__ } from '@native-twin/core';
import { TreeNode } from '@native-twin/helpers/tree';
import {
  BabelJSXElementNode,
  createBabelAST,
  extractMappedAttributes,
  getAstTrees,
  JSXElementTree,
} from '../../jsx-babel';
import { JSXElementNode } from '../models';
import { BabelTransformerService, MetroCompilerContext } from '../services';
import { NativeTwinService } from '../services/NativeTwin.service';

export const babelTraverseCode = (code: string) => {
  return Effect.gen(function* () {
    const transformer = yield* BabelTransformerService;
    const ctx = yield* MetroCompilerContext;
    const ast = createBabelAST(code);
    const trees = yield* pipe(
      Stream.fromIterableEffect(getAstTrees(ast, ctx.filename)),
      Stream.tap((x) => Effect.succeed(x)),
      Stream.mapEffect((x) => extractSheetsFromTree(x.root)),
      Stream.map(HashMap.fromIterable),
      Stream.runFold(HashMap.empty<string, JSXElementNode>(), (prev, current) => {
        return pipe(prev, HashMap.union(current));
      }),
      Effect.map(transformer.transformLeave),
    );

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
    const fileSheet = RA.empty<[string, JSXElementNode]>();

    tree.traverse((leave) => {
      const { value } = leave;
      const runtimeData = extractMappedAttributes(leave.value.babelNode);
      const model = new BabelJSXElementNode({
        leave,
        order: value.order,
        filename: ctx.filename,
        runtimeData,
        twin,
      });
      // const entries = getElementEntries(model.runtimeData, twin.tw, twin.context);
      // const entries = {
      //   model,
      // };
      // const childEntries = pipe(entries, getChildRuntimeEntries);

      // const compiled: CompiledTree = {
      //   childEntries,
      //   entries: entries,
      //   node: model,
      //   parentID: value.parentID,
      //   source: value.source,
      //   parentSize: parent?.childrenCount ?? -1,
      //   order: value.order,
      //   uid: value.uid,
      // };
      fileSheet.push([model.id, model]);
    }, 'breadthFirst');

    return fileSheet;
  });
}
