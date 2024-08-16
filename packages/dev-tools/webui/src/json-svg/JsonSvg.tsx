import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import * as d3 from 'd3';
import { Circle, G, Path, Svg, Text } from 'react-native-svg';
import { useComponentsTree } from '../hooks/useTwinCmpTree';
import { JSXElementNode } from '../models/JSXElement.model';
import { SvgPoint } from './json.types';

export const JsonTreeSvgView = () => {
  const { treeStruct, height, width } = useComponentsTree();

  const linkComponents = useMemo(() => {
    if (!treeStruct) return [];
    return treeStruct.getLinks(treeStruct.treeLayout);
  }, [treeStruct]);

  const nodes = useMemo(() => {
    if (!treeStruct) return [];
    return treeStruct.treeLayout.descendants();
  }, [treeStruct]);
  const svgRef = useRef<any>();
  const contentRef = useRef<any>();
  const domRef = useRef<any>();

  useEffect(() => {
    if (domRef.current) {
      const domEl = d3.select(domRef.current);
      const svg = domEl.select('#tree_view_svg');
      const content = domEl.select('#tree_view_content');
      svg.call(
        // @ts-expect-error
        d3.zoom().transform,
        d3.zoomIdentity.translate(0, 0).scale(1),
      );
      svg.call(
        // @ts-expect-error
        d3
          .zoom()
          .scaleExtent([0.1, 2])
          .filter((event) => {
            return (
              event.target.id == 'tree_view_svg' ||
              event.target.id == 'tree_view_content' ||
              event.shiftKey
            );
          })
          .on('zoom', (event) => {
            content.attr('transform', event.transform);
          }),
      );
    }
  }, [treeStruct]);

  if (!treeStruct) return null;
  return (
    <View ref={domRef}>
      <Svg
        ref={svgRef}
        width={width}
        height={height}
        id='tree_view_svg'
        fill='black'
        style={{
          backgroundColor: 'black',
        }}
      >
        <G id='tree_view_content' ref={contentRef}>
          {linkComponents.map((line, i) => (
            <Path key={`link-${i}`} d={line} stroke='white' fill='none' />
          ))}
          {nodes.map((node, i) => (
            <TreeNodeView
              key={`node-${node.data.node}-${i}`}
              index={i}
              node={node}
              origin={treeStruct.calcNodeOrigin(node)}
              radius={treeStruct.radius}
            />
          ))}
        </G>
        {/* {treeStruct && <TeeView node={treeStruct.struct} />} */}
      </Svg>
    </View>
  );
};

const TreeNodeView = ({
  node,
  origin,
  radius,
  index,
}: {
  index: number;
  radius: number;
  origin: SvgPoint;
  node: d3.HierarchyPointNode<JSXElementNode>;
}) => {
  return (
    <G fontFamily='serif'>
      <Circle cx={origin.x} cy={origin.y} r={radius} fill='#2951a7' />
      <Text
        fill='#FFFFFF'
        x={origin.x}
        textAnchor='middle'
        y={origin.y + 2}
        fontSize={10}
        fontFamily='Inter-SemiBold'
      >
        {`${node.data.node} #${index}`}
      </Text>
    </G>
  );
};
