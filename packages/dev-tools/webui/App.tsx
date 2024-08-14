import { Text } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

export default function App() {
  return (
    <WithSkiaWeb
      getComponent={() => import('./src/json/JsonTreeView')}
      fallback={<Text style={{ textAlign: 'center' }}>Loading Skia...</Text>}
    />
  );
}
