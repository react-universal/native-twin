import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { HashSet } from 'effect';
import { pipe } from 'effect/Function';
import * as HM from 'effect/HashMap';
import * as Option from 'effect/Option';
import { RuntimeTW } from '@native-twin/core';
import { CompilerContext } from '@native-twin/css/jsx';
import { TwinVisitorsState } from '../types/plugin.types';
import { addJsxAttribute } from './jsx.builder';
import { JSXElementNode, jsxElementNodeKey } from './models/JSXElement.model';
import { entriesToObject, runtimeEntriesToAst } from './twin.maps';

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
