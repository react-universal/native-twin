import generate from '@babel/generator';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { TwinCompilerService } from './Compiler.service';
import { JSXElementNode } from './models/JSXElement.model';

export const compileFileWithBabel = Effect.gen(function* () {
  const ctx = yield* MetroTransformerContext;
  const compiler = yield* TwinCompilerService;
  const ast = yield* compiler.getBabelAST(ctx.sourceCode.toString('utf-8'), ctx.filename);
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
      return { sheet, childs };
    }),
  );
  const arr = pipe(RA.fromIterable(elements));
  const code = generate(ast, {
    sourceMaps: false,
  }).code;
  const result = {
    code,
    full: code,
    elements,
    arr,
  };

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
