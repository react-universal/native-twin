import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { PLUGIN_EVENTS } from '@/constants/event.constants';
import { TreeNodeView } from '@/features/json-tree/JsonTree.view';
import { useComponentsTree } from '@/features/json-tree/useJsonTree';
import { useDevToolsClient } from '@/hooks/useDevToolsClient';
import * as d3 from 'd3';
import * as Option from 'effect/Option';
import { G, Path, Svg } from 'react-native-svg';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';

export default function JsonTreeSvgView() {
  const client = useDevToolsClient();
  const { treeStruct, height, width, linkComponents, nodes } = useComponentsTree();

  const svgRef = useRef<any>();
  const contentRef = useRef<any>();
  const domRef = useRef<any>();

  useEffect(() => {
    if (domRef.current) {
      const domEl = d3.select(domRef.current);
      const svg = domEl.select('#tree_view_svg');
      const content = domEl.select('#tree_view_content');

      svg.call(d3.zoom().transform, d3.zoomIdentity.translate(0, 0).scale(1));
      svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 2])
          .filter((event) => {
            return (
              event.target.id === 'tree_view_svg' ||
              event.target.id === 'tree_view_content' ||
              event.shiftKey
            );
          })
          .on('zoom', (event) => {
            content.attr('transform', event.transform);
          }),
      );
    }
  }, [treeStruct]);

  const onPressNode = (node: RawJSXElementTreeNode) => {
    Option.map(client, (plugin) => {
      plugin.sendMessage(PLUGIN_EVENTS.selectedNodeTree, { id: node.id });
    });
  };

  if (!treeStruct) return null;
  return (
    <View ref={domRef}>
      <Svg
        ref={svgRef}
        width={width}
        height={height}
        id='tree_view_svg'
        fill='black'
        className='bg-black'
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
              onClick={onPressNode}
            />
          ))}
        </G>
        {/* {treeStruct && <TeeView node={treeStruct.struct} />} */}
      </Svg>
    </View>
  );
}
