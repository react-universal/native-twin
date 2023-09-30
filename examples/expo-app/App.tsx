import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { setup } from '@universal-labs/native-tw';
import { useLoadFonts } from './src/hooks/useLoadFonts';
import { HomeScreen } from './src/screens/Home.screen';
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
    <View style={{ flex: 1 }}>
      <HomeScreen />
    </View>
  );
}
