import { parse, ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as HashSet from 'effect/HashSet';
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
  filePath: string,
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
