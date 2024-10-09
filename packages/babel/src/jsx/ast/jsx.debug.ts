import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import { RuntimeComponentEntry } from '@native-twin/css/jsx';
import { Tree, TreeNode } from '@native-twin/helpers/tree';
import { JSXElementTree, RuntimeTreeNode } from '../jsx.types';
import { JSXElementNode } from '../../models';

export const elementNodeToTree = (
  treeNode: RuntimeTreeNode,
  filename: string,
): t.ObjectExpression => {
  const childs = pipe(
    treeNode.childs,
    RA.fromIterable,
    RA.map((x) => elementNodeToTree(x, filename)),
  );
  const props = [
    t.objectProperty(
      t.identifier('jsxElementName'),
      t.stringLiteral(treeNode.leave.elementName),
    ),
    t.objectProperty(t.identifier('order'), t.numericLiteral(treeNode.leave.order)),
    t.objectProperty(t.identifier('parentNode'), t.nullLiteral()),
    t.objectProperty(t.identifier('childs'), t.arrayExpression(childs)),
    t.objectProperty(t.identifier('id'), t.stringLiteral(treeNode.leave.id)),
    t.objectProperty(t.identifier('filename'), t.stringLiteral(filename)),
    t.objectProperty(
      t.identifier('source'),
      t.stringLiteral(treeNode.leave.source.source),
    ),
    t.objectProperty(
      t.identifier('importKind'),
      t.stringLiteral(treeNode.leave.source.kind),
    ),
  ];

  return t.objectExpression(props);
};

export const createDevToolsTree = (
  registries: HashMap.HashMap<string, Omit<RuntimeTreeNode, 'childs'>>,
  babelTrees: Tree<JSXElementTree>[],
) =>
  pipe(
    babelTrees,
    RA.map((babelTree) =>
      pipe(
        HashMap.get(registries, babelTree.root.value.uid),
        Option.map((registry) => ({
          ...registry,
          childs: flatLeaveChilds(registries, registry.leave.leave),
        })),
      ),
    ),
    RA.getSomes,
  );

const flatLeaveChilds = (
  trees: HashMap.HashMap<
    string,
    { leave: JSXElementNode; runtimeSheet: RuntimeComponentEntry[] }
  >,
  node: TreeNode<JSXElementTree>,
): RuntimeTreeNode[] => {
  return pipe(
    node.children,
    RA.map((child) =>
      pipe(
        HashMap.get(trees, child.value.uid),
        Option.map((treeElement) => ({
          ...treeElement,
          childs: flatLeaveChilds(trees, child),
        })),
      ),
    ),
    RA.getSomes,
  );
};
