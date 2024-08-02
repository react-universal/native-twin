import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setup } from '@native-twin/core';
import { useNativeTwinDevTools } from '@native-twin/dev-tools/build/useNativeTwinDevTools';
import { HomeScreen } from './src/screens/Home.screen';
import tailwindConfig from './tailwind.config';

setup(tailwindConfig);

export default function App() {
  // return <SimpleComponent />
  useNativeTwinDevTools();
  return (
    <GestureHandlerRootView className='flex-1'>
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
