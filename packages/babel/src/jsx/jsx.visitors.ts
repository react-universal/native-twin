import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { pipe } from 'effect/Function';
import * as HM from 'effect/HashMap';
import * as Option from 'effect/Option';
import { RuntimeTW } from '@native-twin/core';
import { CompilerContext } from '@native-twin/css/jsx';
import { addJsxAttribute } from './jsx.builder';
import { elementNodeToTree } from './jsx.debug';
import { getBabelJSXElementChildsCount } from './jsx.maps';
import {
  JSXElementNode,
  JSXElementNodeKey,
  jsxElementNodeKey,
} from './models/JSXElement.model';
import { entriesToObject, runtimeEntriesToAst } from './twin.maps';

export const visitJSXElement = (
  path: NodePath<t.JSXElement>,
  twin: RuntimeTW,
  ctx: CompilerContext,
  state: {
    visited: HM.HashMap<JSXElementNodeKey, JSXElementNode>;
    filename: string;
  },
) => {
  const nodeKey = jsxElementNodeKey(path.node, state.filename);

  const elementNode = pipe(
    state.visited,
    HM.get(nodeKey),
    Option.getOrElse(() => new JSXElementNode(path.node, 0, state.filename, null)),
  );

  const sheet = elementNode.getTwinSheet(
    twin,
    ctx,
    getBabelJSXElementChildsCount(path.node),
  );

  if (!elementNode.parent) {
    console.log('NO_PARENT');
  }

  const stringEntries = entriesToObject(elementNode.id, sheet.propEntries);
  const astProps = runtimeEntriesToAst(stringEntries.styledProp);

  const treeProp = elementNodeToTree(elementNode, state.filename, path);
  if (!elementNode.parent) {
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
  addJsxAttribute(elementNode.path, '_twinComponentID', elementNode.id);
  addJsxAttribute(elementNode.path, '_twinOrd', elementNode.order);

  return { elementNode, nodeKey };
};
