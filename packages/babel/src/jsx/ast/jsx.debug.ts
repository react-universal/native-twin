import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { TreeNode } from '@native-twin/helpers/build/tree';
import { JSXElementNode } from '../models';

export const elementNodeToTree = (
  leave: TreeNode<JSXElementNode>,
  filename: string,
  path: NodePath<t.JSXElement>,
): t.ObjectExpression => {
  const { value, children } = leave;

  const childs = pipe(
    children,
    RA.fromIterable,
    RA.map((x) => elementNodeToTree(x, filename, path)),
  );
  const props = [
    t.objectProperty(t.identifier('node'), t.stringLiteral(value.elementName)),
    t.objectProperty(t.identifier('order'), t.numericLiteral(value.order)),
    t.objectProperty(t.identifier('parentNode'), t.nullLiteral()),
    t.objectProperty(t.identifier('childs'), t.arrayExpression(childs)),
    t.objectProperty(t.identifier('id'), t.stringLiteral(value.id)),
    t.objectProperty(t.identifier('filename'), t.stringLiteral(filename)),
    t.objectProperty(t.identifier('source'), t.stringLiteral(value.source.source)),
    t.objectProperty(t.identifier('importKind'), t.stringLiteral(value.source.kind)),
  ];

  return t.objectExpression(props);
};
