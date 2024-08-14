import { Vector } from '@shopify/react-native-skia';
import { HierarchyPointNode, TreeLayout } from 'd3';
import { JSXElementNode } from './JSXElement.model';

export interface D3TreeParams {
  node: HierarchyPointNode<JSXElementNode>;
  layout: TreeLayout<JSXElementNode>;
  screenCenter: {
    x: number;
    y: number;
  };
}

export interface TreeNode {
  value: JSXElementNode;
  center: Vector;
  origin: Vector;
  radius: number;
  distance: number;
  childs: TreeNode[];
}

export type ComponentTreeMaps = Map<string, TreeNode>;
