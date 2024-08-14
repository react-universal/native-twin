import { StyleSheet } from 'react-native';
import { Canvas, Fill, Group, BlurMask } from '@shopify/react-native-skia';
import { useComponentsTree } from '../hooks/useTwinCmpTree';
import { RootNodesNode } from './atoms/JsonNode';

export const JsonTreeView = () => {
  const { treeStruct, center } = useComponentsTree();
  return (
    <Canvas style={styles.canvas}>
      <Fill color='rgb(36,43,56)' />
      <Group origin={center} blendMode='screen'>
        <BlurMask style='solid' blur={40} />
        {treeStruct && <RootNodesNode node={treeStruct} />}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: { flex: 1 },
});

export default JsonTreeView;
