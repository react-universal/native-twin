import { pipe } from 'effect';
import { v4 as uuidv4 } from 'uuid';
import { asArray } from '@native-twin/helpers';
import { TreeNode } from '../models/ComponentTrees';
import { TreeNodeDatum, RawNodeDatum } from './json.types';

export const JSON_TREE_ID = 'json_tree_twin';
const treeNodeToDatum = (data: TreeNode): RawNodeDatum => {
  console.log('DATA: ', data);

  const value = data.value;
  const children = data.children;
  return {
    name: value.node,
    attributes: {
      id: value.id,
      name: value.node,
      order: value.order,
    },
    children: children.map((x) => treeNodeToDatum(x)),
  };
};

const rawDatumToDatum = (tree: RawNodeDatum[], currentDepth = 0): TreeNodeDatum[] => {
  const root = asArray(tree);
  return root.map((node) => {
    const datum = node as unknown as TreeNodeDatum;
    datum.__rd3t = {
      id: uuidv4(),
      depth: null,
      collapsed: null,
    } as unknown as TreeNodeDatum['__rd3t'];

    datum.__rd3t.depth = currentDepth;

    if (datum.children && datum.children.length > 0) {
      datum.children = rawDatumToDatum(datum.children, currentDepth + 1);
    }

    return datum;
  });
};

export const treeStructToDatum = (data: TreeNode) =>
  pipe(asArray(treeNodeToDatum(data)), rawDatumToDatum);
