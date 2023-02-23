import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { RootStack } from './src/navigation';
import { HomeScreen } from './src/screens/Home.screen';

export default function App() {
  return (
    <React.StrictMode>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
        <HomeScreen />
      </GestureHandlerRootView>
    </React.StrictMode>
  );
}
