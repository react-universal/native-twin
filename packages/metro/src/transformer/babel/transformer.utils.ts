import generate from '@babel/generator';
// import { parse } from '@babel/parser';
import * as RA from 'effect/Array';
// import traverse from '@babel/traverse';
// import * as t from '@babel/types';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
// import * as HashSet from 'effect/HashSet';
// import * as MutableHashMap from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';
// import { jsxElementNodeKey } from '@native-twin/babel/build/jsx/models/JSXElement.model';
import {
  BabelJSXElementNode,
  BabelJSXElementNodeKey,
  getAstTrees,
  JSXElementTree,
  createBabelAST,
  addTwinPropsToElement,
  getElementEntries,
} from '@native-twin/babel/jsx-babel';
import type { __Theme__ } from '@native-twin/core';
import {
  applyParentEntries,
  ChildsSheet,
  getChildRuntimeEntries,
  RuntimeComponentEntry,
} from '@native-twin/css/jsx';
import { BabelTransformerContext } from './babel.service';

interface CompiledTree {
  elementNode: BabelJSXElementNode;
  entries: RuntimeComponentEntry[];
  childs: CompiledTree[];
  parent: {
    compiled: BabelJSXElementNode;
    tree: JSXElementTree;
    childEntries: ChildsSheet;
  } | null;
}

export const visited = HashMap.empty<BabelJSXElementNodeKey, BabelJSXElementNode>();
// const getVisitedNodes = () => visited;

export const babelTraverseCode = (code: string) => {
  return Effect.gen(function* () {
    // const transformer = yield* BabelTransformerService;
    const ctx = yield* BabelTransformerContext;
    // const generatedCode = yield* transformer.compileCode(ctx.code);

    const ast = createBabelAST(code);

    const tree = yield* getAstTrees(ast, ctx.filename);

    const dfs = pipe(
      tree,
      RA.map((x) => compileNode(x)),
      RA.map((compiledTree) => {
        const { elementNode, entries, parent } = compiledTree;
        const propEntries = pipe(
          Option.fromNullable(parent),
          Option.map((x) =>
            applyParentEntries(
              entries,
              x.childEntries,
              elementNode.order,
              x.tree.childs.length,
            ),
          ),
          Option.getOrElse(() => entries),
        );
        addTwinPropsToElement(compiledTree.elementNode, propEntries, ctx.generate);
        return compiledTree;
      }),
    );
    return {
      dfs,
      generated: Option.fromNullable(generate(ast)).pipe(
        Option.map((x) => x.code),
        Option.getOrElse(() => code),
      ),
      tree,
      nodes: HashMap.fromIterable(visited),
    };

    function compileNode(
      node: JSXElementTree,
      order = 0,
      parent: CompiledTree['parent'] | null = null,
    ): CompiledTree {
      const elementNode = new BabelJSXElementNode(node.path.node, order, ctx.filename);
      const entries = getElementEntries(elementNode.runtimeData, ctx.twin, ctx.twinCtx);
      const childEntries = pipe(entries, getChildRuntimeEntries);
      const childs = pipe(
        node.childs,
        RA.map((x, i) =>
          compileNode(x, i, { compiled: elementNode, tree: node, childEntries }),
        ),
      );
      return {
        elementNode,
        entries,
        childs,
        parent,
      };
    }
  });
};

export const adjacencyMaker = (tree: JSXElementTree[]) => {
  return pipe(
    tree,
    RA.map((x) => Tuple.make(x, x.childs)),
    (x) => new WeakMap<JSXElementTree, JSXElementTree[]>(x),
  );
};
