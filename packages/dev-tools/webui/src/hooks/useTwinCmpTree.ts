import { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { vec } from '@shopify/react-native-skia';
import { useDevToolsPluginClient } from 'expo/devtools';
import { useClientSubscription } from '../hooks/useDevToolsClient';
import { JSXElementNode } from '../models/JSXElement.model';
import { createComponentsTree, createTreeStructure } from '../utils/d3';

export const useComponentsTree = () => {
  const client = useDevToolsPluginClient('@native-twin/dev-tools');
  const [state, setState] = useState<JSXElementNode | null>(null);
  const { width, height } = useWindowDimensions();
  const center = useScreenCenter();

  const treeStruct = useMemo(() => {
    if (!state) return null;
    const { instance, tree } = createComponentsTree(state, { height, width });
    return createTreeStructure({
      layout: instance,
      node: tree,
      screenCenter: center,
    });
  }, [state, center, width, height]);

  useClientSubscription<JSXElementNode>('tree', (data) => {
    if (data && data.childs.length >= 2) {
      setState(() => data);
      client?.sendMessage('tree', data);
    }
  });

  return { treeStruct, center };
};

export const useScreenCenter = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    return vec(width / 2, height / 2);
  }, [height, width]);
};
