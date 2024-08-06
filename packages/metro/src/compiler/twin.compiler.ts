import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { visitElementNode } from './ast/visitors';
import { JSXElementNode } from './models/JSXElement.model';
import { TwinCompilerService } from './models/compiler.model';

export const compileFile = Effect.gen(function* () {
  const compiler = yield* TwinCompilerService;
  const ctx = yield* MetroTransformerContext;

  const parents = yield* compiler.getParentNodes(compiler.ast);

  const elements = pipe(
    createElementStyleSheet(parents),
    HashSet.map((node) => {
      const context = {
        baseRem: ctx.twinConfig.root.rem,
        platform: ctx.options.platform ?? 'ios',
      };
      const sheet = node.getTwinSheet(ctx.twin, context);
      return visitElementNode(node, sheet);
    }),
  );

  // const asd = pipe(
  //   elements,
  //   RA.fromIterable,
  //   RA.map((x) => x.sheet.childEntries.group),
  // );

  yield* Effect.sync(() => compiler.ast.formatText());
  yield* Effect.promise(() => compiler.ast.save());

  const result = {
    code: compiler.ast.getText(),
    full: compiler.ast.getFullText(),
    compilerNode: compiler.ast.compilerNode.text,
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
          createElementStyleSheet(current.childs),
          HashSet.add(current),
          HashSet.union(prev),
        );
      }),
    );
  }
});
