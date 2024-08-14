import { vec, Vector } from '@shopify/react-native-skia';
import * as d3 from 'd3';
import { D3TreeParams, TreeNode } from '../models/ComponentTress';
import { JSXElementNode } from '../models/JSXElement.model';

export const createComponentsTree = (
  rootNode: JSXElementNode,
  layout: {
    width: number;
    height: number;
  },
) => {
  const tree = d3
    .tree<JSXElementNode>()
    .size([layout.width, layout.height])
    .nodeSize([50, 50]);
  const hNode = d3.hierarchy<JSXElementNode>(rootNode, (d) => {
    return d.childs;
  });

  return { tree: tree(hNode), instance: tree };
};

export const d3LayoutToParams = (layout: d3.TreeLayout<JSXElementNode>) => {
  const nodeSize = layout.nodeSize();

  const nodeLayout = {
    width: nodeSize?.[0] ?? 50,
    height: nodeSize?.[1] ?? 50,
  };

  return { nodeLayout };
};

export const createTreeStructure = (params: D3TreeParams): TreeNode => {
  const { layout, node, screenCenter } = params;

  const nodeSize = d3LayoutToParams(layout);
  const r = nodeSize.nodeLayout.height;
  const originX = screenCenter.x + node.x * 3;
  const originY = screenCenter.y + node.y * 3;
  const origin = vec(originX, originY);
  const center = vec(originX, originY);
  const currentNode: TreeNode = {
    center,
    origin,
    childs: [],
    radius: r,
    distance: node.depth + 1,
    value: node.data,
  };

  if (!node.children) return currentNode;

  return {
    ...currentNode,
    childs: node.children.map((x) =>
      createTreeStructure({ layout, node: x, screenCenter }),
    ),
  };
};
