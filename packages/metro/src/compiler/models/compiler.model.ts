import { parse, ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { Node, SourceFile, SyntaxKind } from 'ts-morph';
import { MetroTransformerContext } from '../../transformer/transformer.service';
import { getJSXElementLevel } from '../../utils/jsx.utils';
import { isValidJSXElement } from '../ast/ast.guards';
import { taggedJSXElement } from '../ast/shared.utils';
import type { ValidJSXElementNode } from '../types/tsCompiler.types';
import { JSXElementNode } from './JSXElement.model';

export class TwinCompilerService extends Context.Tag('compiler/file-state')<
  TwinCompilerService,
  {
    getTSast: Effect.Effect<SourceFile>;
    getBabelAST: Effect.Effect<ParseResult<t.File>>;
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
    const code = Buffer.from(ctx.sourceCode).toString('utf-8');

    return {
      getTSast: Effect.sync(() =>
        ctx.tsCompiler.createSourceFile(ctx.filename, code, {
          overwrite: true,
        }),
      ),
      getBabelAST: Effect.sync(() =>
        parse(code, {
          plugins: ['jsx', 'typescript'],
          sourceType: 'module',
          errorRecovery: true,
          tokens: true,
        }),
      ),
      getTsJSXElements: (node: Node) =>
        Effect.sync(() => extractJSXElementsFromNode(node, ctx.filename)),
      getTsParentNodes: (from) =>
        Effect.sync(() => {
          return getNodeJSXElementParents(from, ctx.filename);
        }),
      getBabelParentNodes: (from) =>
        Effect.sync(() => {
          return getBabelJSXElementParents(from, ctx.filename);
        }),
      getJSXElementChilds: (from) => getJSXElementChilds(from, ctx.filename),
    };
  }),
);

const getNodeJSXElementParents = (path: Node, filePath: string) => {
  let level = 0;
  const parentsMap = new Set<JSXElementNode>();
  path.forEachDescendant((descendant, traversal) => {
    if (!Node.isJsxElement(descendant) && !Node.isJsxSelfClosingElement(descendant)) {
      return undefined;
    }
    const node = new JSXElementNode(descendant, 0, getJSXElementLevel(level++), filePath);

    parentsMap.add(node);

    traversal.skip();
  });
  return pipe(parentsMap, HashSet.fromIterable);
};

const getBabelJSXElementParents = (ast: ParseResult<t.File>, filePath: string) => {
  let level = 0;
  const parents = new Set<JSXElementNode>();
  traverse(ast, {
    JSXElement(path) {
      parents.add(
        new JSXElementNode(path.node, 0, getJSXElementLevel(level++), filePath),
      );
      path.skip();
    },
  });
  return HashSet.fromIterable(parents);
};

const extractJSXElementsFromNode = (
  path: Node,
  filePath: string,
): ValidJSXElementNode[] =>
  pipe(
    path.getDescendantsOfKind(SyntaxKind.JsxElement),
    RA.appendAll(path.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)),
  );

export const getJSXElementChilds = (current: JSXElementNode, filePath: string) => {
  return taggedJSXElement.$match({
    JSXelement: (element) => {
      return pipe(
        element.node.getJsxChildren(),
        RA.filterMap((x) => pipe(x, Option.liftPredicate(isValidJSXElement))),
        RA.map(
          (x, i) =>
            new JSXElementNode(
              x,
              i,
              getJSXElementLevel(i, current.level),
              filePath,
              current,
            ),
        ),
        HashSet.fromIterable,
      );
    },
    JSXSelfClosingElement: () => HashSet.empty(),
    BabelJSXElement: ({ node }) => {
      if (node.selfClosing) return HashSet.empty();
      return pipe(
        node.children,
        RA.filterMap((x) => pipe(x, Option.liftPredicate(t.isJSXElement))),
        RA.map(
          (x, i) =>
            new JSXElementNode(
              x,
              i,
              getJSXElementLevel(i, current.level),
              filePath,
              current,
            ),
        ),
        HashSet.fromIterable,
      );
    },
  })(current.path);
};
