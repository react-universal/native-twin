import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import {
  visitJSXElement,
  CacheService,
  BabelJSXElementNode,
  BabelJSXElementNodeKey,
} from '@native-twin/babel/jsx-babel';
import type { __Theme__ } from '@native-twin/core';
import { createBabelAST } from '../../compiler/babel';
import { BabelTransformerContext } from './babel.service';

export const babelTraverseCode = (params: {
  code: string;
  filename: string;
  projectRoot: string;
  cache: CacheService['Type'];
}) =>
  Effect.gen(function* () {
    const ctx = yield* BabelTransformerContext;
    const parsed = createBabelAST(params.code);

    const nodes = yield* Effect.sync(() => {
      const set = new Set<
        [nodeKey: BabelJSXElementNodeKey, elementNode: BabelJSXElementNode]
      >();
      traverse(parsed, {
        JSXElement(path) {
          const filename = params.filename.replace(params.projectRoot, '');

          const visitedNode = visitJSXElement(path, ctx.twin, ctx.twinCtx, {
            filename,
            visited: params.cache.getCache(),
          });
          set.add([visitedNode.nodeKey, visitedNode.elementNode]);

          params.cache.addNewNodeToCache(
            visitedNode.nodeKey,
            visitedNode.elementNode,
            filename,
          );
        },
      });
      return HashMap.fromIterable(set);
    });
    return {
      generated: generate(parsed),
      nodes,
    };
  });
