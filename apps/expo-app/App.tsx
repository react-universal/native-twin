import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { setup } from '@native-twin/core';
import { useLoadFonts } from './src/hooks/useLoadFonts';
import { TabViewExample } from './src/screens/TabsView.screen';
import tailwindConfig from './tailwind.config';

setup(tailwindConfig);

export default function App() {
  const { bootFonts } = useLoadFonts();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (!isReady) {
      bootFonts().then(() => {
        setIsReady(true);
      });
    }
  }, [bootFonts, isReady]);
  if (!isReady) return null;

  return (
    <GestureHandlerRootView className='flex-1 bg-black'>
      {/* className -> style */}
      <SafeAreaView className='flex-1'>
        <TabViewExample />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
