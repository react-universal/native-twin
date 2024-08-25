import { ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { JSXElementNode } from '../models/JSXElement.model';

export const visitBabelJSXElementParents = (
  ast: ParseResult<t.File>,
  filePath: string,
) => {
  const parents = new Set<JSXElementNode>();
  traverse(ast, {
    JSXElement(path) {
      const uid = path.scope.generateUidIdentifier(filePath);
      parents.add(new JSXElementNode(path.node, 0, null, uid.name));
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

export function createElementStyleSheet(
  value: HashSet.HashSet<JSXElementNode>,
): HashSet.HashSet<JSXElementNode> {
  return pipe(
    value,
    HashSet.reduce(HashSet.empty<JSXElementNode>(), (prev, current) => {
      return pipe(
        getBabelJSXElementChilds(current.path, current),
        createElementStyleSheet,
        HashSet.add(current),
        HashSet.union(prev),
      );
    }),
  );
}
