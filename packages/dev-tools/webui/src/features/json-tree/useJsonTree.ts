/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { PLUGIN_EVENTS } from '../../constants/event.constants';
import { useClientSubscription } from '../../hooks/useDevToolsClient';
import { createComponentsTree } from '../../utils/d3';

export const useComponentsTree = () => {
  const [state, setState] = useState<RawJSXElementTreeNode | null>(null);
  const { width, height } = useWindowDimensions();
  const center = useScreenCenter();
  const componentsTree = useMemo(
    () => createComponentsTree({ height, width, nodeSize: 50 }),
    [width, height],
  );

  useClientSubscription<RawJSXElementTreeNode>(PLUGIN_EVENTS.receiveTree, (_, data) => {
    if (data && data.childs.length >= 2) {
      console.log('DATA: ', data);
      setState(() => data);
    }
  });

  const treeStruct = useMemo(() => {
    if (!state) return null;

    return componentsTree(state);
  }, [state, componentsTree]);

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
