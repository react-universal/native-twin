import { ParseResult } from '@babel/parser';
import traverse, { Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { applyParentEntries } from '@native-twin/css/jsx';
import { Tree, TreeNode } from '@native-twin/helpers/tree';
import { mappedComponents, type MappedComponent } from '../../utils/component.maps';
import {
  CompiledTree,
  JSXElementNodePath,
  type JSXElementTree,
  type JSXMappedAttribute,
} from '../jsx.types';
import { JSXElementNode } from '../models/JSXElement.model';
import * as jsxPredicates from './jsx.predicates';

const getJSXElementSource = (path: JSXElementNodePath) =>
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

export const visitBabelJSXElementParents = (
  ast: ParseResult<t.File>,
  filePath: string,
) => {
  const parents = new Set<JSXElementNode>();
  traverse(ast, {
    JSXElement(path) {
      // const uid = path.scope.generateUidIdentifier(filePath);
      parents.add(new JSXElementNode(path.node, 0, filePath, null));
      path.skip();
    },
  });
  return HashSet.fromIterable(parents);
};

export const getBabelJSXElementChilds = (
  node: t.JSXElement,
  parent: JSXElementNode | null,
  filename: string,
) => {
  if (node.selfClosing) return HashSet.empty();
  return pipe(
    node.children,
    RA.filterMap((x) => pipe(x, Option.liftPredicate(t.isJSXElement))),
    RA.map((x, i) => new JSXElementNode(x, i, filename, parent)),
    HashSet.fromIterable,
  );
};

export const getBabelJSXElementChildsCount = (node: t.JSXElement) =>
  pipe(
    node.children,
    RA.filterMap((x) => pipe(x, Option.liftPredicate(t.isJSXElement))),
    RA.length,
  );

export function createJSXElementChilds(
  value: HashSet.HashSet<JSXElementNode>,
): HashSet.HashSet<JSXElementNode> {
  return pipe(
    value,
    HashSet.reduce(HashSet.empty<JSXElementNode>(), (prev, current) => {
      return pipe(
        getBabelJSXElementChilds(current.path, current, current.filename),
        // createJSXElementChilds,
        HashSet.add(current),
        HashSet.union(prev),
      );
    }),
  );
}

export const getAstTrees = (ast: ParseResult<t.File>) => {
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
          const uid = path.scope.generateUid('__twin_root');
          const parentTree = new Tree<JSXElementTree>({
            order: -1,
            path,
            uid,
            source: getJSXElementSource(path),
            parentID: null,
          });
          getChilds(path, parentTree.root);
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

const getChilds = (path: JSXElementNodePath, parent: TreeNode<JSXElementTree>) => {
  const childs = pipe(
    path.get('children'),
    RA.filterMap(Option.liftPredicate(jsxPredicates.isJSXElementPath)),
  );

  for (const child of childs) {
    const order = parent.childrenCount;
    const childLeave = parent.addChild({
      order,
      path: child,
      uid: `${parent.value.uid}:${order}`,
      source: getJSXElementSource(child),
      parentID: parent.value.uid,
    });
    childLeave.parent = parent;
    getChilds(childLeave.value.path, childLeave);
  }
};

export const getJSXCompiledTreeRuntime = (
  leave: CompiledTree,
  parentLeave: Option.Option<CompiledTree>,
) => {
  const runtimeSheet = pipe(
    parentLeave,
    Option.map((parent) =>
      applyParentEntries(
        leave.compiled.entries,
        parent.compiled.childEntries,
        leave.order,
        leave.parentSize,
      ),
    ),
    Option.getOrElse(() => leave.compiled.entries),
  );

  return {
    leave,
    runtimeSheet,
  };
};
