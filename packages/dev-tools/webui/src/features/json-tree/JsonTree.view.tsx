/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import * as d3 from 'd3';
import { Circle, G, Text } from 'react-native-svg';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { SvgPoint } from './json.types';

interface TreeNodeViewProps {
  index: number;
  radius: number;
  origin: SvgPoint;
  node: d3.HierarchyPointNode<RawJSXElementTreeNode>;
  onClick: (node: RawJSXElementTreeNode) => void;
}

export const TreeNodeView = ({
  node,
  origin,
  onClick,
  radius,
  index,
}: TreeNodeViewProps) => {
  useEffect(() => {
    const element = d3.select(`#node-circle-${index}`);
    element.on('click', () => {
      onClick(node.data);
    });
  }, []);

  return (
    <G fontFamily='serif' id={`node-circle-${index}`}>
      <Circle cx={origin.x} cy={origin.y} r={radius} fill='#2951a7' />
      <Text
        fill='#FFFFFF'
        x={origin.x}
        textAnchor='middle'
        y={origin.y + 2}
        fontSize={10}
        className='font-inter-medium'
      >
        {`${node.data.node} #${index}`}
      </Text>
    </G>
  );
};
