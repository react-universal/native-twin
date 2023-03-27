import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { setTailwindConfig } from '@universal-labs/stylesheets/react-native';
import { useLoadFonts } from './src/hooks/useLoadFonts';
// import { FlatListScreen } from './src/screens/FlatList.screen';
import { HomeScreen } from './src/screens/Home.screen';
import tailwindConfig from './tailwind.config';

setTailwindConfig(tailwindConfig);

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      {/* <FlatListScreen /> */}
      <HomeScreen />
    </GestureHandlerRootView>
  );
}
