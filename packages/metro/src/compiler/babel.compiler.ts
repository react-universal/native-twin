import type { ParseResult } from '@babel/parser';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { getJSXElementLevel } from '../utils/jsx.utils';
import { visitElementNode } from './ast/visitors';
import { JSXElementNode } from './models/JSXElement.model';

export const compileFileWithBabel = Effect.gen(function* () {
  const ctx = yield* MetroTransformerContext;
  const ast = yield* Effect.sync(() => parseCode(ctx.sourceCode.toString('utf-8')));
  const parents = getParents(ast);
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
  const arr = pipe(RA.fromIterable(elements));
  const result = {
    code: '',
    full: '',
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

const getParents = (ast: ParseResult<t.File>) => {
  let level = 0;
  const parents = new Set<JSXElementNode>();
  traverse(ast, {
    JSXElement(path) {
      parents.add(new JSXElementNode(path.node, 0, getJSXElementLevel(level++)));
      path.skip();
    },
  });
  return HashSet.fromIterable(parents);
};

const parseCode = (code: string) =>
  parse(code, {
    plugins: ['jsx', 'typescript'],
    sourceType: 'module',
    errorRecovery: true,
  });
