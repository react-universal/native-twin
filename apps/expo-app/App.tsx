import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setup } from '@native-twin/core';
import { TabViewExample } from './src/screens/TabsView.screen';
import tailwindConfig from './tailwind.config';

setup(tailwindConfig);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TabViewExample />
    </GestureHandlerRootView>
  );
}
