import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StrictMode } from 'react';
import { setup } from '@native-twin/core';
import { HomeScreen } from './src/screens/Home.screen';
import tailwindConfig from './tailwind.config';

setup(tailwindConfig);

export default function App() {
  return (
    <StrictMode>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HomeScreen />
      </GestureHandlerRootView>
    </StrictMode>
  );
}
