import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { HashSet } from 'effect';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HM from 'effect/HashMap';
import * as Option from 'effect/Option';
import { RuntimeTW } from '@native-twin/core';
import { CompilerContext } from '@native-twin/css/jsx';
import { TwinVisitorsState } from '../types/plugin.types';
import { addJsxAttribute } from './jsx.builder';
import { getJSXElementName } from './jsx.maps';
import { JSXElementNode, jsxElementNodeKey } from './models/JSXElement.model';
import { entriesToObject, runtimeEntriesToAst } from './twin.maps';

const elementNodeToTree = (node: JSXElementNode): t.ObjectExpression => {
  const name = pipe(
    getJSXElementName(node.openingElement),
    Option.getOrElse(() => 'Unknown'),
  );

  const childs = pipe(
    node.childs,
    RA.fromIterable,
    RA.map((x) => elementNodeToTree(x)),
  );
  const props = [
    t.objectProperty(t.identifier('node'), t.stringLiteral(name)),
    t.objectProperty(t.identifier('order'), t.numericLiteral(node.order)),
    t.objectProperty(t.identifier('parentNode'), t.nullLiteral()),
    t.objectProperty(t.identifier('childs'), t.arrayExpression(childs)),
    t.objectProperty(t.identifier('id'), t.stringLiteral(node.id)),
  ];

  return t.objectExpression(props);
};
const visitJSXElement = (
  path: NodePath<t.JSXElement>,
  twin: RuntimeTW,
  ctx: CompilerContext,
  state: TwinVisitorsState,
) => {
  const nodeKey = jsxElementNodeKey(path, state);

  const elementNode = pipe(
    state.visited,
    HM.get(nodeKey),
    Option.map((x) => x),
    Option.match({
      onNone: () => new JSXElementNode(path, 0, state, null),
      onSome: (x) => x,
    }),
  );

  const sheet = elementNode.getTwinSheet(twin, ctx, HashSet.size(elementNode.childs));

  const stringEntries = entriesToObject(elementNode.id, sheet.propEntries);
  const astProps = runtimeEntriesToAst(stringEntries.styledProp);

  if (!elementNode.parent) {
    const treeProp = elementNodeToTree(elementNode);
    if (treeProp.properties.length > 0) {
      elementNode.openingElement.attributes.push(
        t.jsxAttribute(
          t.jsxIdentifier('_twinComponentTree'),
          t.jsxExpressionContainer(treeProp),
        ),
      );
    }
  }
  if (astProps) {
    elementNode.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('_twinComponentSheet'),
        t.jsxExpressionContainer(astProps),
      ),
    );
  }

  const astTemplateProps = runtimeEntriesToAst(stringEntries.templateEntries);
  if (astTemplateProps) {
    elementNode.openingElement.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('_twinComponentTemplateEntries'),
        t.jsxExpressionContainer(astTemplateProps),
      ),
    );
  }
  addJsxAttribute(elementNode.path.node, '_twinComponentID', elementNode.id);
  addJsxAttribute(elementNode.path.node, '_twinOrd', elementNode.order);

  return { elementNode, nodeKey };
};

const jsxVisitors = {
  visitJSXElement,
};

export default jsxVisitors;
