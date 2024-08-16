import { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { PLUGIN_EVENTS } from '../../constants/event.constants';
import { useClientSubscription } from '../../hooks/useDevToolsClient';
import { JSXElementNode } from '../../models/JSXElement.model';
import { createComponentsTree } from '../../utils/d3';

export const useComponentsTree = () => {
  const [state, setState] = useState<JSXElementNode | null>(null);
  const { width, height } = useWindowDimensions();
  const center = useScreenCenter();

  const componentsTree = useMemo(
    () => createComponentsTree({ height, width, nodeSize: 50 }),
    [width, height],
  );
  const treeStruct = useMemo(() => {
    if (!state) return null;

    return componentsTree(state);
  }, [state, componentsTree]);

  useClientSubscription<JSXElementNode>('tree', (client, data) => {
    if (data && data.childs.length >= 2) {
      setState(() => data);
      client.sendMessage(PLUGIN_EVENTS.receiveTree, data);
    }
  });

  return { treeStruct, center, width, height };
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
