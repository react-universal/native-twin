import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import setup from '@react-universal/core/react-native';
import { HomeScreen } from './src/screens/Home.screen';
import tailwindConfig from './tailwind.config';

export default function App() {
  useEffect(() => {
    setup(tailwindConfig);
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
