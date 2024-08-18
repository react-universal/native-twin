/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { PLUGIN_EVENTS } from '@/constants/event.constants';
import { HierarchyPointNode } from 'd3-hierarchy';
import * as Option from 'effect/Option';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { useDevToolsClient } from '../../hooks/useDevToolsClient';
import { createComponentsTree } from '../../utils/d3';

export const useComponentsTree = (rawNode: RawJSXElementTreeNode) => {
  const client = useDevToolsClient();

  const { width, height } = useWindowDimensions();
  const componentsTree = useMemo(
    () => createComponentsTree({ height, width, nodeSize: 50 }),
    [width, height],
  );

  const treeStruct = useMemo(() => componentsTree(rawNode), [rawNode, componentsTree]);

  const linkComponents: string[] = useMemo(() => {
    return treeStruct.getLinks(treeStruct.treeLayout);
  }, [treeStruct]);

  const nodes: HierarchyPointNode<RawJSXElementTreeNode>[] = useMemo(
    () => treeStruct.treeLayout.descendants(),
    [treeStruct],
  );

  const onPressNode = (node: RawJSXElementTreeNode) => {
    Option.map(client, (plugin) => {
      plugin.sendMessage(PLUGIN_EVENTS.selectedNodeTree, { id: node.id });
    });
  };

  return { treeStruct, width, height, linkComponents, nodes, onPressNode };
};

export const useScreenCenter = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    return {
      x: width / 2,
      y: height / 2,
    };
  }, [height, width]);
};
