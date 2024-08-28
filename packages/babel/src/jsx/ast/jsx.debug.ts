import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { RuntimeTreeNode } from '../jsx.types';

export const elementNodeToTree = (
  treeNode: RuntimeTreeNode,
  filename: string,
): t.ObjectExpression => {
  const childs = pipe(
    treeNode.childs,
    RA.fromIterable,
    RA.map((x) => elementNodeToTree(x, filename)),
  );
  const props = [
    t.objectProperty(t.identifier('jsxElementName'), t.stringLiteral(treeNode.leave.elementName)),
    t.objectProperty(t.identifier('order'), t.numericLiteral(treeNode.leave.order)),
    t.objectProperty(t.identifier('parentNode'), t.nullLiteral()),
    t.objectProperty(t.identifier('childs'), t.arrayExpression(childs)),
    t.objectProperty(t.identifier('id'), t.stringLiteral(treeNode.leave.id)),
    t.objectProperty(t.identifier('filename'), t.stringLiteral(filename)),
    t.objectProperty(
      t.identifier('source'),
      t.stringLiteral(treeNode.leave.source.source),
    ),
    t.objectProperty(
      t.identifier('importKind'),
      t.stringLiteral(treeNode.leave.source.kind),
    ),
  ];

  return t.objectExpression(props);
};
