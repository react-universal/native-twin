import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { visitElementNode } from './ast/visitors';
import { getJSXElementChilds, TwinCompilerService } from './Compiler.service';
import { JSXElementNode } from './models/JSXElement.model';

export const compileFile = Effect.gen(function* () {
  const compiler = yield* TwinCompilerService;
  const ctx = yield* MetroTransformerContext;

  const ast = yield* compiler.getTSast(ctx.filename, ctx.sourceCode.toString('utf-8'));
  const parents = yield* compiler.getTsParentNodes(ast);

  const elements = pipe(
    createElementStyleSheet(parents),
    HashSet.map((node) => {
      const context = {
        baseRem: ctx.twinConfig.root.rem,
        platform: ctx.options.platform ?? 'ios',
      };
      const childs = getJSXElementChilds(node, ctx.filename);
      const sheet = node.getTwinSheet(ctx.twin, context, HashSet.size(childs));
      return visitElementNode(node, sheet);
    }),
  );

  yield* Effect.sync(() => ast.formatText());
  yield* Effect.promise(() => ast.save());

  const result = {
    code: ast.getText(),
    full: ast.getFullText(),
    compilerNode: ast.compilerNode.text,
    elements,
  };

  return result;

  function createElementStyleSheet(
    value: HashSet.HashSet<JSXElementNode>,
  ): HashSet.HashSet<JSXElementNode> {
    return pipe(
      value,
      HashSet.reduce(HashSet.empty<JSXElementNode>(), (prev, current) => {
        return pipe(
          getJSXElementChilds(current, ctx.filename),
          createElementStyleSheet,
          HashSet.add(current),
          HashSet.union(prev),
        );
      }),
    );
  }
});

export function createElementStyleSheet(
  value: HashSet.HashSet<JSXElementNode>,
  filePath: string,
): HashSet.HashSet<JSXElementNode> {
  return pipe(
    value,
    HashSet.reduce(HashSet.empty<JSXElementNode>(), (prev, current) => {
      return pipe(
        getJSXElementChilds(current, filePath),
        (x) => createElementStyleSheet(x, filePath),
        HashSet.add(current),
        HashSet.union(prev),
      );
    }),
  );
}
