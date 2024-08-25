import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { getBabelJSXElementChilds, getJSXElementName } from './jsx.maps';
import { JSXElementNode } from './models/JSXElement.model';

export const elementNodeToTree = (
  node: JSXElementNode,
  filename: string,
  path: NodePath<t.JSXElement>,
): t.ObjectExpression => {
  const name = pipe(
    getJSXElementName(node.openingElement),
    Option.getOrElse(() => 'Unknown'),
  );

  const childs = pipe(
    getBabelJSXElementChilds(node.path, null, filename),
    RA.fromIterable,
    RA.map((x) => elementNodeToTree(x, filename, path)),
  );
  const binding = node.binding(path);
  const importSource = node.getImportSource(binding);
  const props = [
    t.objectProperty(t.identifier('node'), t.stringLiteral(name)),
    t.objectProperty(t.identifier('order'), t.numericLiteral(node.order)),
    t.objectProperty(t.identifier('parentNode'), t.nullLiteral()),
    t.objectProperty(t.identifier('childs'), t.arrayExpression(childs)),
    t.objectProperty(t.identifier('id'), t.stringLiteral(node.id)),
    t.objectProperty(t.identifier('filename'), t.stringLiteral(filename)),
    t.objectProperty(t.identifier('source'), t.stringLiteral(importSource)),
  ];

  return t.objectExpression(props);
};
