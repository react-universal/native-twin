import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useDevToolsPluginClient } from 'expo/devtools';
import { useClientSubscription } from '../hooks/useDevToolsClient';
import { JSXElementNode } from '../models/JSXElement.model';
import { createComponentsTree } from '../utils/d3';

export const useComponentsTree = () => {
  const client = useDevToolsPluginClient('@native-twin/dev-tools');
  const [state, setState] = useState<JSXElementNode | null>(null);
  const { width, height } = useWindowDimensions();
  const center = useScreenCenter();

  const componentsTree = useCallback(
    createComponentsTree({ height, width, nodeSize: 50 }),
    [width, height],
  );
  const treeStruct = useMemo(() => {
    if (!state) return null;

    return componentsTree(state);
  }, [state, center, width, height]);

  useClientSubscription<JSXElementNode>('tree', (data) => {
    if (data && data.childs.length >= 2) {
      setState(() => data);
      client?.sendMessage('tree', data);
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
