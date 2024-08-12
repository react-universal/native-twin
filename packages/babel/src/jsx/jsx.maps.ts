import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { Option } from 'effect';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import type { RuntimeTW } from '@native-twin/core';
import {
  createPrimitiveExpression,
  templateLiteralToStringLike,
} from '../babel/babel.constructors';
import { hasJsxAttribute } from '../babel/babel.validators';
import { mappedComponents, type MappedComponent } from '../utils/component.maps';
import * as jsxPredicates from './jsx.predicates';
import type {
  AnyPrimitive,
  JSXChildElement,
  JSXElementHandler,
  JSXMappedAttribute,
  MapAttributeFn,
  StyledPropEntries,
} from './jsx.types';

export const addOrderToJSXChilds = (element: JSXElementHandler) => {
  let ord = 0;
  element.mutateChilds((x) => {
    if (!t.isJSXElement(x)) return x;
    if (ord === 0) {
      addJsxAttribute(x, 'firstChild', true);
    }
    addJsxAttribute(x, 'ord', ord++);
    if (ord === element.childrenCount) {
      addJsxAttribute(x, 'lastChild', true);
    }
    return x;
  });
};

export const extractElementClassNames = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => extractClassNameProp(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};

export const extractClassNameProp = (
  attribute: t.JSXAttribute,
  config: MappedComponent,
): JSXMappedAttribute | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(attribute)) return null;
  if (!t.isJSXIdentifier(attribute.name)) return null;
  const className = validClassNames.find((x) => attribute.name.name === x[0]);
  if (!className) return null;

  if (t.isStringLiteral(attribute.value)) {
    return {
      prop: className[0],
      target: className[1],
      value: attribute.value,
    };
  }
  if (
    t.isJSXExpressionContainer(attribute.value) &&
    t.isTemplateLiteral(attribute.value.expression)
  ) {
    return {
      prop: className[0],
      target: className[1],
      value: attribute.value.expression,
    };
  }
  return null;
};

export const compileMappedAttributes = (
  mapped: JSXMappedAttribute[],
  twin: RuntimeTW,
) => {
  return mapped.map((x) => compileMappedAttribute(x, twin));
};

const compileMappedAttribute = (classNameValue: JSXMappedAttribute, twin: RuntimeTW) => {
  const classProp: StyledPropEntries = {
    entries: [],
    prop: classNameValue.prop,
    target: classNameValue.target,
    expression: null,
    classNames: '',
  };
  if (t.isStringLiteral(classNameValue.value)) {
    classProp.classNames = classNameValue.value.value;
    classProp.entries = twin(classNameValue.value.value);
  }
  if (t.isTemplateLiteral(classNameValue.value)) {
    const cooked = templateLiteralToStringLike(classNameValue.value);
    classProp.classNames = cooked.strings;
    classProp.entries = twin(`${cooked.strings}`);
    // classProp.expression = cooked.expressions;
  }

  return classProp;
};

export const createJsxAttribute = (name: string, value: AnyPrimitive) => {
  const expression = createPrimitiveExpression(value);
  return t.jsxAttribute(t.jsxIdentifier(name), t.jsxExpressionContainer(expression));
};

export const addJsxAttribute = (
  element: JSXChildElement,
  name: string,
  value: AnyPrimitive,
) => {
  if (!t.isJSXElement(element)) return;
  if (hasJsxAttribute(element, name, value)) return;
  const newAttribute = createJsxAttribute(name, value);
  element.openingElement.attributes.push(newAttribute);
};

export const createRequireExpression = (path: string) => {
  return t.callExpression(t.identifier('require'), [t.stringLiteral(path)]);
};

export const getJSXAttributePaths = (path: NodePath<t.JSXElement>) =>
  pipe(
    RA.ensure(path.get('openingElement.attributes')),
    RA.filter(jsxPredicates.isJSXAttributePath),
  );

export const getJSXAttributeName = (id: t.JSXAttribute) =>
  pipe(
    id,
    Option.liftPredicate((x) => t.isJSXIdentifier(x.name)),
    Option.flatMap((x) => {
      if (!t.isJSXIdentifier(x.name)) return Option.none();

      return Option.some(x.name);
    }),
  );

export const findMapJSXAttributeByName = (paths: t.JSXAttribute[], name: string) =>
  pipe(
    paths,
    RA.findFirst((x) =>
      Option.Do.pipe(
        () => Option.some({ path: x }),
        Option.bind('name', ({ path }) => getJSXAttributeName(path)),
        Option.flatMap((x) => (x.name.name === name ? Option.some(x) : Option.none())),
      ),
    ),
  );

export const traverseJSXElementChilds = (
  path: NodePath<t.JSXElement>,
  onChild: (child: NodePath<t.JSXElement>, index: number) => void,
) => {
  pipe(
    RA.ensure(path.get('children')),
    RA.filter(jsxPredicates.isJSXElementPath),
    RA.forEach(onChild),
  );
};

export const mapJSXElementAttributes =
  (openingElement: t.JSXOpeningElement) => (fn: MapAttributeFn) => {
    openingElement.attributes = openingElement.attributes.map((x) => {
      if (!t.isJSXAttribute(x)) return x;
      return fn(x);
    });
  };

const getElementName = (openingElement: t.JSXOpeningElement) => {
  if (t.isJSXIdentifier(openingElement.name)) {
    return Option.some(openingElement.name.name);
  }
  return Option.none();
};

export const getElementConfig = (openingElement: t.JSXOpeningElement) => {
  return getElementName(openingElement).pipe(
    Option.flatMap((name) =>
      Option.fromNullable(mappedComponents.find((x) => x.name === name)),
    ),
  );
};
