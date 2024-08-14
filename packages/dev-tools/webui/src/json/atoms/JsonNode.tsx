import { Circle, Group } from '@shopify/react-native-skia';
import { TreeNode } from '../../models/ComponentTrees';

export const RootNodesNode = ({ node }: { node: TreeNode }) => {
  return (
    <Group origin={node.origin}>
      <TreeNodeView node={node} />
      <TreeNodeChilds parent={node} nodes={node.childs} />
    </Group>
  );
};

const TreeNodeView = ({ node }: { node: TreeNode }) => {
  return <Circle cx={node.origin.x} cy={node.origin.y} r={node.radius} color='#2951a7' />;
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
