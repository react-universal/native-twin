import { useEffect, useState } from 'react';
import { View } from '@universal-labs/primitives';
import { setTailwindConfig } from '@universal-labs/stylesheets';
import { useLoadFonts } from './src/hooks/useLoadFonts';
// import { FlatListScreen } from './src/screens/FlatList.screen';
import { HomeScreen } from './src/screens/Home.screen';
import tailwindConfig from './tailwind.config';

setTailwindConfig(tailwindConfig, 14);

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
    <View style={{ backgroundColor: 'black', flex: 1 }}>
      <HomeScreen />
    </View>
  );
}
