import { parse, ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { JSXElementNode } from '../models/JSXElement.model';

export const createBabelAST = (code: string) => {
  return parse(code, {
    plugins: ['jsx', 'typescript'],
    sourceType: 'module',
    errorRecovery: true,
    tokens: true,
  });
};

export const visitBabelJSXElementParents = (
  ast: ParseResult<t.File>,
  _filePath: string,
) => {
  const parents = new Set<JSXElementNode>();
  traverse(ast, {
    JSXElement(path) {
      // const uid = path.scope.generateUidIdentifier(filePath);
      parents.add(new JSXElementNode(path.node, 0, null));
      path.skip();
    },
  });
  return HashSet.fromIterable(parents);
};

export const getBabelJSXElementChilds = (
  node: t.JSXElement,
  parent: JSXElementNode | null,
) => {
  if (node.selfClosing) return HashSet.empty();
  return pipe(
    node.children,
    RA.filterMap((x) => pipe(x, Option.liftPredicate(t.isJSXElement))),
    RA.map((x, i) => new JSXElementNode(x, i, parent)),
    HashSet.fromIterable,
  );
};
