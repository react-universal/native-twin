import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { setTailwindConfig } from '@universal-labs/stylesheets/react-native';
import { ShadowsScreen } from './src/screens/Shadows.screen';
import tailwindConfig from './tailwind.config';

setTailwindConfig(tailwindConfig);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      <ShadowsScreen />
    </GestureHandlerRootView>
  );
}
