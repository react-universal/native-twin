import { ParseResult } from '@babel/parser';
import traverse, { Binding, NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import { Tree } from '../utils/Tree';
import { TreeNode } from '../utils/TreeNode';
import { mappedComponents, type MappedComponent } from '../utils/component.maps';
import * as jsxPredicates from './jsx.predicates';
import { JSXFileTree, type JSXElementTree, type JSXMappedAttribute } from './jsx.types';
import { JSXElementNode } from './models/JSXElement.model';

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
export const getBingingImportSource = (binding: Binding) =>
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

export const getAstTrees = (ast: ParseResult<t.File>, filename: string) => {
  return Effect.gen(function* () {
    const parentPaths = yield* getParentPaths(ast, filename);
    // const fileTrees = yield* pipe(
    //   parentPaths.parents,
    //   RA.map((node) =>
    //     Effect.async<Tree<JSXElementTree>>((resume) => {
    //       return traverseJSXRootNode(node.path).pipe(
    //         Effect.andThen(
    //           resume,
    //           // Effect.map((childs) =>
    //           //   pipe(
    //           //     childs,
    //           //     RA.forEach((x) => tree.root.addChild(x)),
    //           //     () => tree,
    //           //   ),
    //           // ),
    //         ),
    //       );
    //     }),
    //   ),
    //   Effect.allSuccesses,
    // );
    return parentPaths;
    //   return pipe(
    //     parentPaths,
    //     Stream.fromIterable,
    //     // Stream.mapEffect((node) => {
    //     //   return Effect.async<JSXElementTree[]>((resume) => {
    //     //     return traverseJSXRootNode(node.parent.value).pipe(Effect.andThen(resume));
    //     //   });
    //     // }),
    //     Stream.runCollect,
    //     Effect.map(Chunk.toArray),
    //   );
  });
};

export const getParentPaths = (ast: ParseResult<t.File>, filePath: string) => {
  return Effect.promise(
    () =>
      new Promise<JSXFileTree>((resolve) => {
        traverse(
          ast,
          {
            Program: {
              exit() {
                resolve(this.tree);
              },
            },
            JSXElement(path) {
              const node = getJSXElementNode(path);
              // this.tree.parents.push(node);
              const parentTree = new Tree(node);
              getChilds(path, parentTree.root);
              this.tree.parents.push(parentTree);
              path.skip();
            },
          },
          undefined,
          {
            tree: {
              filePath,
              parents: [],
            } as JSXFileTree,
          },
        );
      }),
  );
};

function getJSXElementNode(path: NodePath<t.JSXElement>): JSXElementTree {
  return {
    path,
    childs: [],
  };
}

const getChilds = (path: NodePath<t.JSXElement>, parent: TreeNode<JSXElementTree>) => {
  if (path.node.children.filter((x) => t.isJSXElement(x)).length === 0) {
    return;
  }
  const childs = path
    .get(
      'children',
      //   , {
      //   parentPath: path,
      //   opts: {
      //     JSXElement(childPath) {
      //       childPath.skip();
      //     },
      //   },
      //   scope: path.scope,
      //   state: {},
      // }
    )
    .filter((x) => x.isJSXElement());
  for (const child of childs) {
    if (!child.isJSXElement()) continue;
    const childNode = getJSXElementNode(child);
    const childLeave = parent.addChild(childNode);
    childLeave.parent = parent;
    getChilds(childLeave.value.path, childLeave);
  }
  return parent;
};

export const traverseJSXRootNode = (parentNode: NodePath<t.JSXElement>) =>
  Effect.promise(() => {
    // return Promise.resolve(Effect.succeed(tree));
    return new Promise<Effect.Effect<Tree<JSXElementTree>>>((resume) => {
      const tree = new Tree(getJSXElementNode(parentNode));
      traverse(
        parentNode.node,
        {
          exit() {
            resume(Effect.succeed(tree));
          },
          JSXElement(path) {
            // const newTree: JSXElementTree[] = [];
            const childTree = new TreeNode(getJSXElementNode(path));
            const parent = getChilds(path, childTree);
            parent;
            path.skip();
          },
          // JSXElement: {
          //   enter(path) {
          //     newTree.push(getJSXElementNode(path));
          //   },
          //   exit() {
          //     if (newTree.length > 1) {
          //       const child = newTree.pop();
          //       const parent = newTree[newTree.length - 1];
          //       if (child && parent) {
          //         parent.childs.push(child);
          //       }
          //     }
          //   },
          // },
        },
        // {
        //   tree: [] as JSXElementTree[],
        // },
      );
    });
  });
