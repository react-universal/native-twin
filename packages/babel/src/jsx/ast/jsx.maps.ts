import { ParseResult } from '@babel/parser';
import traverse, { Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import { applyParentEntries } from '@native-twin/css/jsx';
import { Tree, TreeNode } from '@native-twin/helpers/tree';
import { mappedComponents, type MappedComponent } from '../../utils/component.maps';
import {
  JSXElementNodePath,
  type JSXElementTree,
  type JSXMappedAttribute,
} from '../jsx.types';
import { JSXElementNode } from '../models';
import * as jsxPredicates from './jsx.predicates';

export const getJSXElementSource = (path: JSXElementNodePath) =>
  pipe(
    getJSXElementName(path.node.openingElement),
    Option.flatMap((x) => Option.fromNullable(path.scope.getBinding(x))),
    Option.flatMap((binding) => getBindingImportSource(binding)),
    Option.getOrElse(() => ({ kind: 'local', source: 'unknown' })),
  );

const getBindingImportDeclaration = (binding: Binding) =>
  pipe(
    binding.path,
    Option.liftPredicate(jsxPredicates.isImportSpecifier),
    Option.bindTo('importSpecifier'),
    Option.bind('importDeclaration', ({ importSpecifier }) =>
      Option.liftPredicate(importSpecifier.parentPath, jsxPredicates.isImportDeclaration),
    ),
    Option.map((source) => ({
      kind: 'import',
      source: source.importDeclaration.node.source.value,
    })),
  );

const getBindingRequireDeclaration = (binding: Binding) =>
  pipe(
    binding.path,
    Option.liftPredicate(jsxPredicates.isVariableDeclaratorPath),
    Option.bindTo('importSpecifier'),
    Option.bind('requireExpression', ({ importSpecifier }) =>
      pipe(
        Option.fromNullable(importSpecifier.node.init),
        Option.flatMap((init) =>
          Option.liftPredicate(init, jsxPredicates.isCallExpression),
        ),
        Option.flatMap((x) => RA.head(x.arguments)),
        Option.flatMap((x) => Option.liftPredicate(x, t.isStringLiteral)),
      ),
    ),
    Option.map((source) => {
      return {
        kind: 'require',
        source: source.requireExpression.value,
      };
    }),
  );
export const getBindingImportSource = (binding: Binding) =>
  pipe(
    [getBindingImportDeclaration(binding), getBindingRequireDeclaration(binding)],
    Option.firstSomeOf,
  );

/**
 * @internal
 * @category Transformer
 * @domain Babel
 * Extract {@link JSXMappedAttribute[]} list from a jsx Attribute
 * */
const getJSXMappedAttributes = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => extractStyledProp(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};

/**
 * @category Transformer
 * @domain Babel
 * Extract {@link JSXMappedAttribute[]} list from a jsx Attribute
 * */
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
 * * @internal
 * @domain Babel
 * @description Extract the {@link MappedComponent} from any {@link ValidJSXElementNode}
 * */
const getJSXElementConfig = (tagName: string) => {
  const componentConfig = mappedComponents.find((x) => x.name === tagName);
  if (!componentConfig) return null;

  return componentConfig;
};

/**
 * @domain Babel
 * @description Extract the {@link t.JSXAttribute[]} from any {@link t.JSXElement}
 * */
export const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  pipe(element.openingElement.attributes, RA.filter(jsxPredicates.isJSXAttribute));

/**
 * @domain Babel
 * @description Extract the {@link JSXMappedAttribute} from any {@link t.JSXAttribute}
 * */
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
  if (t.isJSXExpressionContainer(attribute.value)) {
    if (t.isTemplateLiteral(attribute.value.expression)) {
      return {
        prop: className[0],
        target: className[1],
        value: attribute.value.expression,
      };
    }
    if (t.isCallExpression(attribute.value.expression)) {
      return {
        prop: className[0],
        target: className[1],
        value: t.templateLiteral(
          [
            t.templateElement({ raw: '', cooked: '' }),
            t.templateElement({ raw: '', cooked: '' }),
          ],
          [attribute.value.expression],
        ),
      };
    }
  }
  return null;
};

export const getJSXElementName = (
  openingElement: t.JSXOpeningElement,
): Option.Option<string> => {
  if (t.isJSXIdentifier(openingElement.name)) {
    return Option.some(openingElement.name.name);
  }
  return Option.none();
};

export const getBabelJSXElementChildsCount = (node: t.JSXElement) =>
  pipe(
    node.children,
    RA.filterMap((x) => pipe(x, Option.liftPredicate(t.isJSXElement))),
    RA.length,
  );

export const getAstTrees = (ast: ParseResult<t.File>, filename: string) => {
  return Effect.async<Tree<JSXElementTree>[]>((resolve) => {
    traverse(
      ast,
      {
        Program: {
          exit() {
            resolve(Effect.succeed(this.trees));
          },
        },
        JSXElement(path) {
          const hash = Hash.string(filename);
          const uid = path.scope.generateUid('__twin_root');
          const parentTree = new Tree<JSXElementTree>({
            order: -1,
            babelNode: path.node,
            uid: `${hash}__:${uid}`,
            source: getJSXElementSource(path),
            parentID: null,
          });
          gelBabelJSXElementChildLeaves(path, parentTree.root);
          this.trees.push(parentTree);
          path.skip();
        },
      },
      undefined,
      {
        trees: [] as Tree<JSXElementTree>[],
      },
    );
  });
};

export const gelBabelJSXElementChildLeaves = (path: JSXElementNodePath, parent: TreeNode<JSXElementTree>) => {
  const childs = pipe(
    path.get('children'),
    RA.filterMap(Option.liftPredicate(jsxPredicates.isJSXElementPath)),
  );

  for (const childPath of childs) {
    const order = parent.childrenCount;
    const childLeave = parent.addChild({
      order,
      babelNode: childPath.node,
      uid: `${parent.value.uid}:${order}`,
      source: getJSXElementSource(childPath),
      parentID: parent.value.uid,
    });
    childLeave.parent = parent;
    gelBabelJSXElementChildLeaves(childPath, childLeave);
  }
};

export const getJSXCompiledTreeRuntime = (
  leave: JSXElementNode,
  parentLeave: Option.Option<JSXElementNode>,
) => {
  const runtimeSheet = pipe(
    parentLeave,
    Option.map((parent) =>
      applyParentEntries(
        leave.entries,
        parent.childEntries,
        leave.order,
        leave.parentSize,
      ),
    ),
    Option.getOrElse(() => leave.entries),
  );

  return {
    leave,
    runtimeSheet,
  };
};
