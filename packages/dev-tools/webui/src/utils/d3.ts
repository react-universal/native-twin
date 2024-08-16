import * as d3 from 'd3';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { SvgPoint } from '../json-svg/json.types';
import { JSXElementNode } from '../models/JSXElement.model';

export const createComponentsTree = (layout: {
  width: number;
  height: number;
  nodeSize: number;
}) => {
  const tree = d3
    .tree<JSXElementNode>()
    .size([layout.width / 2, layout.height / 2])
    .nodeSize([layout.nodeSize, layout.nodeSize]);

  const nodeSize = {
    width: tree.nodeSize()?.[0] ?? 50,
    height: tree.nodeSize()?.[1] ?? 50,
  };
  const svgCenter: SvgPoint = {
    x: layout.width / 2,
    y: layout.height / 2,
  };

  const radius = nodeSize.width;

  const calcNodeOrigin = (from: SvgPoint): SvgPoint => {
    return {
      x: svgCenter.x + from.x * 3,
      y: nodeSize.height + from.y * 3,
    };
  };

  const getLinks = (rootNode: d3.HierarchyPointNode<JSXElementNode>) => {
    return pipe(
      rootNode.links(),
      RA.flatMap((link) => {
        const sourceX = svgCenter.x + link.source.x * 3;
        const sourceY = link.source.y * 3 + nodeSize.height * 2;
        const targetX = svgCenter.x + link.target.x * 3;
        const targetY = link.target.y * 3;

        const line = d3.linkVertical()({
          source: [sourceX, sourceY],
          target: [targetX, targetY],
        });
        if (!line) return [];
        return [line];
      }),
    );
  };

  return (jsxElement: JSXElementNode) => {
    const rootNode = d3.hierarchy<JSXElementNode>(jsxElement, (d) => {
      return d.childs;
    });

    const treeLayout = tree(rootNode);

    return {
      treeLayout,
      nodeSize,
      rootNode,
      radius,
      getLinks,
      calcNodeOrigin,
    };
  };
};
