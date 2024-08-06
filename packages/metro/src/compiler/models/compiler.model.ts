import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import { Node, SourceFile, SyntaxKind } from 'ts-morph';
import { MetroTransformerContext } from '../../transformer/transformer.service';
import { getJSXElementLevel } from '../../utils/jsx.utils';
import type { ValidJSXElementNode } from '../ast/tsCompiler.types';
import { JSXElementNode } from './JSXElement.model';

export class TwinCompilerService extends Context.Tag('compiler/file-state')<
  TwinCompilerService,
  {
    ast: SourceFile;
    getJSXElements: Effect.Effect<ValidJSXElementNode[]>;
    getParentNodes: (from: Node) => Effect.Effect<HashSet.HashSet<JSXElementNode>>;
  }
>() {}

export const TwinCompilerServiceLive = Layer.scoped(
  TwinCompilerService,
  Effect.gen(function* () {
    const ctx = yield* MetroTransformerContext;
    const code = Buffer.from(ctx.sourceCode).toString('utf-8');
    const ast = ctx.tsCompiler.createSourceFile(ctx.filename, code, {
      overwrite: true,
    });

    return {
      ast,
      getJSXElements: Effect.sync(() => extractJSXElementsFromNode(ast)),
      getParentNodes: (from) =>
        Effect.sync(() => {
          return getNodeJSXElementParents(from);
        }),
    };
  }),
);

const getNodeJSXElementParents = (path: Node) => {
  let level = 0;
  const parentsMap = new Set<JSXElementNode>();
  path.forEachDescendant((descendant, traversal) => {
    if (!Node.isJsxElement(descendant) && !Node.isJsxSelfClosingElement(descendant)) {
      return undefined;
    }
    const node = new JSXElementNode(descendant, 0, getJSXElementLevel(level++));

    parentsMap.add(node);

    traversal.skip();
  });
  return pipe(parentsMap, HashSet.fromIterable);
};

const extractJSXElementsFromNode = (path: Node): ValidJSXElementNode[] =>
  pipe(
    path.getDescendantsOfKind(SyntaxKind.JsxElement),
    RA.appendAll(path.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)),
  );
