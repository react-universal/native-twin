import { useEffect } from 'react';
import { useNativeTwinDevTools } from '@native-twin/dev-tools';

export const useTwinDevTools = (tree: any) => {
  const plugin = useNativeTwinDevTools();

  useEffect(() => {
    plugin.registerTree(tree);
  }, [tree]);
};
