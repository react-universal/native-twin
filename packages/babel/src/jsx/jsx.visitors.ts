import { Visitor, PluginPass } from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { Option, pipe } from 'effect';
import * as RA from 'effect/Array';
import { RuntimeTW } from '@native-twin/core';
// import { pipe } from 'effect/Function';
// import * as Option from 'effect/Option';
import {
  addJsxAttribute,
  extractClassNameProp,
  getElementConfig,
  getJSXAttributePaths,
  traverseJSXElementChilds,
} from './jsx.maps';
import { JSXMappedAttribute } from './jsx.types';
import { entriesToObject, getElementEntries, runtimeEntriesToAst } from './twin.maps';

// import * as jsxPredicates from './jsx.predicates';

const updateJSXAttributes: Visitor<{ order: number }> = {
  JSXOpeningElement(path, state) {
    if (RA.isArray(path.node.attributes)) {
      state.order++;
      path.node.attributes.push(
        t.jsxAttribute(
          t.jsxIdentifier('_twinOrder'),
          t.jsxExpressionContainer(t.numericLiteral(state.order)),
        ),
      );
    }
  },
};
const visitJSXElement = (
  path: NodePath<t.JSXElement>,
  twin: RuntimeTW,
  state: PluginPass,
) => {
  const openingElementPath = path.get('openingElement');
  // const mapOpeningElement = mapJSXElementAttributes(openingElementPath.node);
  const attributes = getJSXAttributePaths(path);
  const mappedAttributes: JSXMappedAttribute[] = getElementConfig(
    openingElementPath.node,
  ).pipe(
    Option.map((x) =>
      pipe(
        attributes,
        RA.map((attr) => pipe(Option.fromNullable(extractClassNameProp(attr.node, x)))),
        RA.getSomes,
      ),
    ),
    Option.getOrElse(() => []),
  );
  const compiled = getElementEntries(mappedAttributes, twin, {
    baseRem: twin.config.root.rem,
    platform: 'ios',
  });
  const babelID = path.scope.generateUidIdentifier(`${state.filename}`);
  // const cachedHash = Hash.cached({babelID});
  const componentID = `${babelID.name}-${path.listKey ?? 'no-list'}`;
  const stringEntries = entriesToObject(componentID, compiled);
  const astProps = runtimeEntriesToAst(stringEntries.styledProp);
  if (astProps) {
    openingElementPath.node.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('_twinComponentSheet'),
        t.jsxExpressionContainer(astProps),
      ),
    );
  }

  const astTemplateProps = runtimeEntriesToAst(stringEntries.templateEntries);
  if (astTemplateProps) {
    openingElementPath.node.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('_twinComponentTemplateEntries'),
        t.jsxExpressionContainer(astTemplateProps),
      ),
    );
  }
  addJsxAttribute(path.node, '_twinComponentID', componentID);

  traverseJSXElementChilds(path, (child, index) => {
    addJsxAttribute(child.node, '_twinOrd', index);

    if (child.node.selfClosing) return;
    visitJSXElement(child, twin, state);
  });
};

const jsxVisitors = {
  visitJSXElement,
  updateJSXAttributes,
};
export default jsxVisitors;
