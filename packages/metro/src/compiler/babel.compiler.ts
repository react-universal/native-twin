import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import generate from '@babel/generator';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { visitElementNode } from './ast/visitors';
import { JSXElementNode } from './models/JSXElement.model';
import { TwinCompilerService } from './models/compiler.model';

export const compileFileWithBabel = Effect.gen(function* () {
  const ctx = yield* MetroTransformerContext;
  const compiler = yield* TwinCompilerService;
  const ast = yield* compiler.getBabelAST;
  const parents = yield* compiler.getBabelParentNodes(ast);
  const elements = pipe(
    createElementStyleSheet(parents),
    HashSet.map((node) => {
      const context = {
        baseRem: ctx.twinConfig.root.rem,
        platform: ctx.options.platform ?? 'ios',
      };
      const childs = compiler.getJSXElementChilds(node);
      const sheet = node.getTwinSheet(ctx.twin, context, HashSet.size(childs));
      return visitElementNode(node, sheet);
    }),
  );
  const arr = pipe(RA.fromIterable(elements));
  const result = {
    code: generate(ast).code,
    full: generate(ast).code,
    elements,
  };
  console.log(arr);

  return result;

  function createElementStyleSheet(
    value: HashSet.HashSet<JSXElementNode>,
  ): HashSet.HashSet<JSXElementNode> {
    return pipe(
      value,
      HashSet.reduce(HashSet.empty<JSXElementNode>(), (prev, current) => {
        return pipe(
          compiler.getJSXElementChilds(current),
          createElementStyleSheet,
          HashSet.add(current),
          HashSet.union(prev),
        );
      }),
    );
  }
});
