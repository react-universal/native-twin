import generate from '@babel/generator';
// import { parse } from '@babel/parser';
import * as RA from 'effect/Array';
// import traverse from '@babel/traverse';
// import * as t from '@babel/types';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
// import * as HashMap from 'effect/HashMap';
// import * as HashSet from 'effect/HashSet';
// import * as MutableHashMap from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import * as Tuple from 'effect/Tuple';
// import { jsxElementNodeKey } from '@native-twin/babel/build/jsx/models/JSXElement.model';
import {
  BabelJSXElementNode,
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
  node: BabelJSXElementNode;
  entries: RuntimeComponentEntry[];
  childEntries: ChildsSheet;
}

// const getVisitedNodes = () => visited;

export const babelTraverseCode = (code: string) => {
  return Effect.gen(function* () {
    // const transformer = yield* BabelTransformerService;
    const ctx = yield* BabelTransformerContext;
    // const generatedCode = yield* transformer.compileCode(ctx.code);

    const ast = createBabelAST(code);

    const trees = yield* getAstTrees(ast, ctx.filename);

    const dfs = pipe(
      trees.parents,
      RA.map((tree) => {
        const mapped = tree.map<CompiledTree>((leave) => {
          const node = leave.value.path.node;

          const current = new BabelJSXElementNode(node, -1, ctx.filename, null);
          const entries = getElementEntries(current.runtimeData, ctx.twin, ctx.twinCtx);
          const childEntries = pipe([...entries], getChildRuntimeEntries);
          leave.value = {
            // @ts-expect-error
            node: current,
            // entries: pipe(entries,RA.filter(x => x)),
            entries,
            childEntries,
          };
          return leave as any;
        });

        pipe(
          mapped.all(),
          RA.forEach((currentNode) => {
            const {
              value: { entries, node },
              parent,
            } = currentNode;
            const runtimeEntries = pipe(
              Option.fromNullable(parent),
              Option.map((parentNode) => {
                const order = parentNode.children.indexOf(currentNode);
                return applyParentEntries(
                  entries,
                  parentNode.value.childEntries,
                  order,
                  parentNode.childrenCount,
                );
              }),
              Option.getOrElse(() => entries),
            );
            addTwinPropsToElement(node, runtimeEntries, ctx.generate);
          }),
        );

        return mapped;
      }),
    );
    return {
      dfs,
      generated: Option.fromNullable(generate(ast)).pipe(
        Option.map((x) => x.code),
        Option.getOrElse(() => code),
      ),
      trees,
    };

    // function compileNode(
    //   node: JSXElementTree,
    //   order = 0,
    //   parent: CompiledTree['parent'] | null = null,
    // ): CompiledTree {

    //   return {
    //     elementNode,
    //     entries,
    //     childs,
    //     parent,
    //   };
    // }
  });
};

export const adjacencyMaker = (tree: JSXElementTree[]) => {
  return pipe(
    tree,
    RA.map((x) => Tuple.make(x, x.childs)),
    (x) => new WeakMap<JSXElementTree, JSXElementTree[]>(x),
  );
};
