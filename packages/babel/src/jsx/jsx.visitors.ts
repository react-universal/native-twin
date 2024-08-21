import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { HashMap } from 'effect';
import { pipe } from 'effect/Function';
import * as HM from 'effect/HashMap';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { RuntimeTW } from '@native-twin/core';
import { CompilerContext } from '@native-twin/css/jsx';
import { addJsxAttribute } from './jsx.builder';
import { elementNodeToTree } from './jsx.debug';
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
    visited: HashMap.HashMap<JSXElementNodeKey, JSXElementNode>;
    filename: string;
  },
) => {
  const nodeKey = jsxElementNodeKey(path, state.filename);

  const elementNode = pipe(
    state.visited,
    HM.get(nodeKey),
    Option.getOrElse(() => new JSXElementNode(path, 0, state.filename, null)),
  );

  const sheet = elementNode.getTwinSheet(twin, ctx, HashSet.size(elementNode.childs));

  const stringEntries = entriesToObject(elementNode.id, sheet.propEntries);
  const astProps = runtimeEntriesToAst(stringEntries.styledProp);

  if (!elementNode.parent) {
    // console.log('STATE: ', state);
    const treeProp = elementNodeToTree(elementNode, state.filename);
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
