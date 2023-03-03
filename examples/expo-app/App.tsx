import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { setTailwindConfig } from '@react-universal/core/react-native';
import { HomeScreen } from './src/screens/Home.screen';
import tailwindConfig from './tailwind.config';

setTailwindConfig(tailwindConfig);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
