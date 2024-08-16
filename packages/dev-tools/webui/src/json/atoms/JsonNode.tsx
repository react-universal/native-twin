import { Circle, Group, Text, useFont } from '@shopify/react-native-skia';
import { TreeNode } from '../../models/ComponentTrees';

export const RootNodesNode = ({ node }: { node: TreeNode }) => {
  return (
    <Group origin={node.origin}>
      <TreeNodeView node={node} />
      <TreeNodeChilds parent={node} nodes={node.children} />
    </Group>
  );
};

const TreeNodeView = ({ node }: { node: TreeNode }) => {
  const font = useFont(require('../fonts/Inter-Medium.ttf'), 16);

  return (
    <>
      <Text
        text={node.value.node}
        font={font}
        color='#FFFFFF'
        x={node.origin.x - node.nodeSize.width / 2 + 16}
        y={node.origin.y}
      />
      <Circle cx={node.origin.x} cy={node.origin.y} r={node.radius} color='#2951a7' />
    </>
  );
};

const TreeNodeChilds = ({ parent, nodes }: { parent: TreeNode; nodes: TreeNode[] }) => {
  return (
    <Group origin={parent.origin}>
      {nodes.map((x, i) => (
        <RootNodesNode
          key={`${nodes.length}-${i}-${x.value.id}-${x.value.order}`}
          node={x}
        />
      ))}
    </Group>
  );
};
