import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { getJSXElementName } from './jsx.maps';
import { JSXElementNode } from './models/JSXElement.model';

export const elementNodeToTree = (
  node: JSXElementNode,
  filename: string,
): t.ObjectExpression => {
  const name = pipe(
    getJSXElementName(node.openingElement),
    Option.getOrElse(() => 'Unknown'),
  );

  const childs = pipe(
    node.childs,
    RA.fromIterable,
    RA.map((x) => elementNodeToTree(x, filename)),
  );
  const props = [
    t.objectProperty(t.identifier('node'), t.stringLiteral(name)),
    t.objectProperty(t.identifier('order'), t.numericLiteral(node.order)),
    t.objectProperty(t.identifier('parentNode'), t.nullLiteral()),
    t.objectProperty(t.identifier('childs'), t.arrayExpression(childs)),
    t.objectProperty(t.identifier('id'), t.stringLiteral(node.id)),
    t.objectProperty(t.identifier('fileName'), t.stringLiteral(filename)),
  ];

  return t.objectExpression(props);
};
