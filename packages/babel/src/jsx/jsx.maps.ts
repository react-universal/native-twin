import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type { RuntimeTW } from '@native-twin/core';
import { templateLiteralToStringLike } from '../babel/babel.constructors';
import { mappedComponents, type MappedComponent } from '../utils/component.maps';
import * as jsxPredicates from './jsx.predicates';
import type { JSXMappedAttribute, MapAttributeFn, StyledPropEntries } from './jsx.types';

export const extractMappedAttributes = (node: t.JSXElement): JSXMappedAttribute[] => {
  const attributes = getJSXElementAttrs(node);
  return pipe(
    getJSXElementName(node.openingElement),
    Option.flatMap((x) => Option.fromNullable(getJSXElementConfig(x))),
    Option.map((mapped) => getJSXMappedAttributes(attributes, mapped)),
    Option.getOrElse(() => []),
  );
};

/**
 * @category Transformer
 * @domain Babel
 * Extract {@link JSXMappedAttribute[]} list from a jsx Attribute
 * */
export const getJSXMappedAttributes = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => extractStyledProp(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};

/**
 * @domain Shared Transform
 * @description Extract the {@link MappedComponent} from any {@link ValidJSXElementNode}
 * */
export const getJSXElementConfig = (tagName: string) => {
  const componentConfig = mappedComponents.find((x) => x.name === tagName);
  if (!componentConfig) return null;

  return componentConfig;
};

export const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  pipe(element.openingElement.attributes, RA.filter(jsxPredicates.isJSXAttribute));

export const extractStyledProp = (
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

export const compileMappedAttributes = (mapped: JSXMappedAttribute[], twin: RuntimeTW) =>
  pipe(
    mapped,
    RA.map((x) => compileMappedAttribute(x, twin)),
  );

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

export const getJSXElementName = (openingElement: t.JSXOpeningElement): Option.Option<string> => {
  if (t.isJSXIdentifier(openingElement.name)) {
    return Option.some(openingElement.name.name);
  }
  return Option.none();
};

export const getElementConfig = (openingElement: t.JSXOpeningElement) => {
  return getJSXElementName(openingElement).pipe(
    Option.flatMap((name) =>
      Option.fromNullable(mappedComponents.find((x) => x.name === name)),
    ),
  );
};
