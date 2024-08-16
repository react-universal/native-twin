import { HierarchyPointNode } from 'd3';

export interface SvgPoint {
  x: number;
  y: number;
}

export interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
}

export interface TreeNodeDatum extends RawNodeDatum {
  children?: TreeNodeDatum[];
  __rd3t: {
    id: string;
    depth: number;
    collapsed: boolean;
  };
}

export interface TreeLinkDatum {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
}
