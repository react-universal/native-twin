import generator from '@babel/generator';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Option from 'effect/Option';
import { getRuleSelectorGroup } from '@native-twin/css';
// import { templateLiteralToStringLike } from '../babel';
import { isReactNativeImport } from '../babel/babel.validators';
import { mappedComponents } from '../utils/component.maps';
import { extractElementClassNames } from './jsx.maps';
import type {
  JSXElementHandler,
  JSXMappedAttribute,
  JSXOpeningElementHandler,
  MapAttributeFn,
  MapChildFn,
  RuntimeComponentEntry,
  StyledPropEntries,
} from './jsx.types';

export const createJSXElementHandler = (
  path: NodePath<t.JSXElement>,
): JSXElementHandler => {
  const openingElementHandler = createJSXOpeningElementHandler(path.node.openingElement);

  return {
    openingElement: openingElementHandler,
    childrenCount: countJSXElementChilds(path.node),
    mutateChilds,
    getBinding,
    isReactNativeImport: isImportedFromRN,
  };

  function isImportedFromRN() {
    return getBinding()
      .pipe(Option.map((x) => isReactNativeImport(x)))
      .pipe(Option.getOrElse(() => false));
  }

  function getBinding() {
    return openingElementHandler
      .getElementName()
      .pipe(Option.flatMap((x) => Option.fromNullable(path.scope.getBinding(x))));
  }

  function mutateChilds(fn: MapChildFn) {
    if (openingElementHandler.isSelfClosed()) return;
    path.node.children = path.node.children.map((x) => {
      if (!t.isJSXElement(x)) return x;
      return fn(x);
    });
  }

  function countJSXElementChilds(element: t.JSXElement) {
    return element.children.filter((x) => t.isJSXElement(x)).length;
  }
};

export const createJSXOpeningElementHandler = (
  openingElement: t.JSXOpeningElement,
): JSXOpeningElementHandler => {
  return {
    openingElement,
    getElementName,
    getElementConfig,
    mutateAttributes,
    getAttributes,
    isSelfClosed,
    extractClassNames,
    addStyledProp,
    styledPropsToObject,
  };

  function addStyledProp(id: string, classProps: StyledPropEntries) {
    if (classProps.expression) {
      const template = t.jsxAttribute(
        t.jsxIdentifier('__classNameExpression'),
        t.jsxExpressionContainer(classProps.expression),
      );
      openingElement.attributes.push(template);
    }
    // const value = t.memberExpression(
    //   t.identifier('__twinComponentStyles'),
    //   t.stringLiteral(id),
    //   true,
    // );

    // const jsxClassProp = t.jsxAttribute(
    //   t.jsxIdentifier('styledProps'),
    //   t.jsxExpressionContainer(value),
    // );

    // openingElement.attributes.push(jsxClassProp);
  }

  function styledPropsToObject(
    classProps: StyledPropEntries,
  ): [string, RuntimeComponentEntry] {
    const metadata = getEntryGroups(classProps);
    const data: RuntimeComponentEntry = {
      prop: classProps.prop,
      target: classProps.target,
      entries: classProps.entries,
      metadata,
      expression: classProps.expression ? generator(classProps.expression).code : ``,
    };
    return [classProps.classNames, data];
  }

  function getEntryGroups(
    classProps: StyledPropEntries,
  ): RuntimeComponentEntry['metadata'] {
    return classProps.entries
      .map((x) => [x.className, ...x.selectors])
      .reduce(
        (prev, current): RuntimeComponentEntry['metadata'] => {
          const selector = getRuleSelectorGroup(current);
          if (current.includes('group')) {
            prev.isGroupParent = true;
          }
          if (selector === 'group') {
            prev.hasGroupEvents = true;
          }
          if (selector === 'pointer') {
            prev.hasPointerEvents = true;
          }

          return prev;
        },
        {
          hasAnimations: false,
          hasGroupEvents: false,
          hasPointerEvents: false,
          isGroupParent: false,
        } as RuntimeComponentEntry['metadata'],
      );
  }

  function isSelfClosed() {
    return openingElement.selfClosing;
  }
  function getElementConfig() {
    return getElementName().pipe(
      Option.flatMap((name) =>
        Option.fromNullable(mappedComponents.find((x) => x.name === name)),
      ),
    );
  }

  function extractClassNames() {
    return getElementConfig().pipe(
      Option.flatMap((x) =>
        Option.fromNullable(extractElementClassNames(getAttributes(), x)),
      ),
      Option.getOrElse((): JSXMappedAttribute[] => []),
    );
  }

  function getElementName() {
    if (t.isJSXIdentifier(openingElement.name)) {
      return Option.some(openingElement.name.name);
    }
    return Option.none();
  }

  function mutateAttributes(fn: MapAttributeFn) {
    openingElement.attributes = openingElement.attributes.map((x) => {
      if (!t.isJSXAttribute(x)) return x;
      return fn(x);
    });
  }

  function getAttributes() {
    return openingElement.attributes.filter((x) => t.isJSXAttribute(x));
  }
};
