import generate from '@babel/generator';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type { __Theme__ } from '@native-twin/core';
import { RuntimeComponentEntry } from '@native-twin/css/build/jsx';
import { Tree, TreeNode } from '@native-twin/helpers/tree';
import { createBabelAST } from '../../babel';
import { JSXElementTree, RuntimeTreeNode } from '../jsx.types';
import { JSXElementNode } from '../models';
import { BabelTransformerService, MetroCompilerContext } from '../services';
import { NativeTwinService } from '../services/NativeTwin.service';
import { addJsxExpressionAttribute } from './jsx.builder';
import { elementNodeToTree } from './jsx.debug';
import { extractMappedAttributes, getAstTrees } from './jsx.maps';

export const getBabelTreesStream = () => {};

export const babelTraverseCode = (code: string) => {
  return Effect.gen(function* () {
    const transformer = yield* BabelTransformerService;
    const ctx = yield* MetroCompilerContext;
    const ast = createBabelAST(code);
    const babelTrees = yield* getAstTrees(ast, ctx.filename);
    const trees = yield* pipe(
      Stream.fromIterable(babelTrees),
      Stream.mapEffect(extractSheetsFromTree),
      Stream.map(HashMap.fromIterable),
      Stream.runFold(HashMap.empty<string, JSXElementNode>(), (prev, current) => {
        return pipe(prev, HashMap.union(current));
      }),
      Effect.map(transformer.transformLeave),
    );

    const devToolsTree = pipe(
      createDevToolsTree(trees, babelTrees),
      RA.fromIterable,
      RA.map((x) => {
        const elementTree = elementNodeToTree(x, x.leave.filename);
        addJsxExpressionAttribute(x.leave.path, '_twinComponentTree', elementTree);
        return x;
      }),
    );

    return {
      trees,
      devToolsTree,
      generated: pipe(
        Option.fromNullable(generate(ast)),
        Option.map((x) => x.code),
        Option.getOrElse(() => code),
      ),
    };
  });
};

const createDevToolsTree = (
  registries: HashMap.HashMap<string, Omit<RuntimeTreeNode, 'childs'>>,
  babelTrees: Tree<JSXElementTree>[],
) =>
  pipe(
    babelTrees,
    RA.map((babelTree) =>
      pipe(
        HashMap.get(registries, babelTree.root.value.uid),
        Option.map((registry) => ({
          ...registry,
          childs: flatLeaveChilds(registries, registry.leave.leave),
        })),
      ),
    ),
    RA.getSomes,
  );

const flatLeaveChilds = (
  trees: HashMap.HashMap<
    string,
    { leave: JSXElementNode; runtimeSheet: RuntimeComponentEntry[] }
  >,
  node: TreeNode<JSXElementTree>,
): RuntimeTreeNode[] => {
  return pipe(
    node.children,
    RA.map((child) =>
      pipe(
        HashMap.get(trees, child.value.uid),
        Option.map((treeElement) => ({
          ...treeElement,
          childs: flatLeaveChilds(trees, child),
        })),
      ),
    ),
    RA.getSomes,
  );
};

const extractSheetsFromTree = (tree: Tree<JSXElementTree>) =>
  Effect.gen(function* () {
    // const fileSheet = MutableHashMap.empty<string, CompiledTree>();
    const ctx = yield* MetroCompilerContext;
    const twin = yield* NativeTwinService;
    const fileSheet = RA.empty<[string, JSXElementNode]>();

    tree.traverse((leave) => {
      const { value } = leave;
      const runtimeData = extractMappedAttributes(leave.value.babelNode);
      const model = new JSXElementNode({
        leave,
        order: value.order,
        filename: ctx.filename,
        runtimeData,
        twin,
      });
      fileSheet.push([model.id, model]);
    }, 'breadthFirst');

    return fileSheet;
  });
