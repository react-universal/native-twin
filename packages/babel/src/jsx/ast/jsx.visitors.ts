import generate from '@babel/generator';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type { __Theme__ } from '@native-twin/core';
import { Tree } from '@native-twin/helpers/tree';
import { createBabelAST } from '../../babel';
import { JSXElementTree, RuntimeTreeNode } from '../jsx.types';
import { JSXElementNode } from '../models';
import { BabelTransformerService, MetroCompilerContext } from '../services';
import { NativeTwinService } from '../services/NativeTwin.service';
import { addJsxExpressionAttribute } from './jsx.builder';
import { createDevToolsTree, elementNodeToTree } from './jsx.debug';
import { extractMappedAttributes, getAstTrees } from './jsx.maps';

export const transformJSXFile = (code: string) => {
  return Effect.gen(function* () {
    const transformer = yield* BabelTransformerService;
    const ctx = yield* MetroCompilerContext;

    const ast = createBabelAST(code);
    const babelTrees = yield* getAstTrees(ast, ctx.filename);
    const registry = yield* pipe(
      Stream.fromIterable(babelTrees),
      Stream.mapEffect(extractSheetsFromTree),
      Stream.map(HashMap.fromIterable),
      Stream.runFold(HashMap.empty<string, JSXElementNode>(), (prev, current) => {
        return pipe(prev, HashMap.union(current));
      }),
    );

    const trees: HashMap.HashMap<
      string,
      Omit<RuntimeTreeNode, 'childs'>
    > = yield* Effect.if(
      Effect.sync(() => ctx.platform !== 'web'),
      {
        onFalse: () =>
          Effect.sync(() => {
            return HashMap.empty<string, Omit<RuntimeTreeNode, 'childs'>>();
          }),
        onTrue: () =>
          Effect.sync(() => {
            return transformer.transformLeave(registry);
          }),
      },
    );

    const devToolsTree = pipe(
      createDevToolsTree(trees, babelTrees),
      RA.fromIterable,
      RA.map((x) => {
        if (ctx.platform !== 'web') {
          const elementTree = elementNodeToTree(x, x.leave.filename);
          addJsxExpressionAttribute(x.leave.path, '_twinComponentTree', elementTree);
        }
        return x;
      }),
    );

    let generatedCode = pipe(
      Option.fromNullable(generate(ast)),
      Option.map((x) => x.code),
      Option.getOrElse(() => code),
    );

    const classNames = pipe(
      HashMap.values(transformer.transformLeave(registry)),
      RA.fromIterable,
      RA.flatMap((x) => x.runtimeSheet),
      RA.map((x) => x.classNames),
      RA.join('\n'),
    );

    return {
      trees,
      devToolsTree,
      classNames,
      generated: generatedCode,
      cssImports: pipe(
        trees,
        HashMap.values,
        RA.fromIterable,
        RA.flatMap((x) => x.leave.leave.value.cssImports),
        RA.dedupe,
      ),
    };
  });
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
