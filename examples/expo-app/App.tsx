import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { setTailwindConfig } from '@universal-labs/stylesheets/react-native';
import { FlatListScreen } from './src/screens/FlatList.screen';
import tailwindConfig from './tailwind.config';

setTailwindConfig(tailwindConfig);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      <FlatListScreen />
    </GestureHandlerRootView>
  );
}
