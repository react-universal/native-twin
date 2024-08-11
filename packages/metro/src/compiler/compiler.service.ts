import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { Node, SourceFile, SyntaxKind } from 'ts-morph';
import { MetroTransformerContext } from '../transformer/transformer.service';
import { taggedJSXElement } from './ast/ast.matchers';
import {
  createBabelAST,
  getBabelJSXElementChilds,
  visitBabelJSXElementParents,
} from './babel';
import { JSXElementNode } from './models/JSXElement.model';
import { isValidJSXElement } from './ts/ts.constructors';
import type { ValidJSXElementNode } from './ts/ts.types';

export class TwinCompilerService extends Context.Tag('compiler/file-state')<
  TwinCompilerService,
  {
    getTSast: (code: string, filename: string, ) => Effect.Effect<SourceFile>;
    getBabelAST: (code: string, filename: string) => Effect.Effect<ParseResult<t.File>>;
    getTsJSXElements: (node: Node) => Effect.Effect<ValidJSXElementNode[]>;
    getTsParentNodes: (from: Node) => Effect.Effect<HashSet.HashSet<JSXElementNode>>;
    getBabelParentNodes: (
      from: ParseResult<t.File>,
    ) => Effect.Effect<HashSet.HashSet<JSXElementNode>>;
    getJSXElementChilds: (from: JSXElementNode) => HashSet.HashSet<JSXElementNode>;
  }
>() {}

export const TwinCompilerServiceLive = Layer.scoped(
  TwinCompilerService,
  Effect.gen(function* () {
    const ctx = yield* MetroTransformerContext;

    return {
      getTSast: (code, filename) =>
        Effect.sync(() =>
          ctx.tsCompiler.createSourceFile(filename, code, {
            overwrite: true,
          }),
        ),
      getBabelAST: (code) => Effect.sync(() => createBabelAST(code)),
      getTsJSXElements: (node: Node) =>
        Effect.sync(() => extractJSXElementsFromNode(node, ctx.filename)),
      getTsParentNodes: (from) =>
        Effect.sync(() => {
          return getNodeJSXElementParents(from, ctx.filename);
        }),
      getBabelParentNodes: (from) =>
        Effect.sync(() => visitBabelJSXElementParents(from, ctx.filename)),
      getJSXElementChilds: (from) => getJSXElementChilds(from, ctx.filename),
    };
  }),
);

const getNodeJSXElementParents = (path: Node, _filePath: string) => {
  const parentsMap = new Set<JSXElementNode>();
  path.forEachDescendant((descendant, traversal) => {
    if (!Node.isJsxElement(descendant) && !Node.isJsxSelfClosingElement(descendant)) {
      return undefined;
    }
    const node = new JSXElementNode(descendant, 0);
    parentsMap.add(node);
    traversal.skip();
  });
  return pipe(parentsMap, HashSet.fromIterable);
};

const extractJSXElementsFromNode = (
  path: Node,
  _filePath: string,
): ValidJSXElementNode[] =>
  pipe(
    path.getDescendantsOfKind(SyntaxKind.JsxElement),
    RA.appendAll(path.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)),
  );

export const getJSXElementChilds = (current: JSXElementNode, _filePath: string) => {
  return taggedJSXElement.$match({
    JSXelement: (element) => {
      return pipe(
        element.node.getJsxChildren(),
        RA.filterMap((x) => pipe(x, Option.liftPredicate(isValidJSXElement))),
        RA.map((x, i) => new JSXElementNode(x, i, current)),
        HashSet.fromIterable,
      );
    },
    JSXSelfClosingElement: () => HashSet.empty(),
    BabelJSXElement: ({ node }) => getBabelJSXElementChilds(node, current),
  })(current.path);
};
