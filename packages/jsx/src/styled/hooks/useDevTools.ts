import { useEffect, useState } from 'react';
import { RawJSXElementTreeNode } from '@native-twin/css/build/jsx';
import { useNativeTwinDevTools } from '@native-twin/dev-tools';
import { asArray } from '@native-twin/helpers';

const flattenChilds = (tree: RawJSXElementTreeNode): RawJSXElementTreeNode[] => {
  return asArray(tree).flatMap((x) => [x, ...x.childs.map((y) => flattenChilds(y))]).flat();
};
export const useTwinDevTools = (id: string, tree: RawJSXElementTreeNode) => {
  const [isSelected, setIsSelected] = useState(false);

  const plugin = useNativeTwinDevTools();

  useEffect(() => {
    const sb = plugin.addListener('tree/node/selected', (data: any) => {
      if (!tree) return;
      const childs = flattenChilds(tree);
      console.log('CHILDS: ', childs);
      const node = childs.find((x) => x.id === data.id);
      if (node) {
        console.log(data, id);
        setIsSelected(true);
      }
    });
    return () => {
      sb();
    };
  }, [plugin, id, tree]);

  useEffect(() => {
    if (tree) {
      plugin.registerTree(tree);
    }
  }, [tree, plugin]);

  return { isSelected };
};
