import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { install } from '@universal-labs/styled';
import { useLoadFonts } from './src/hooks/useLoadFonts';
import { HomeScreen } from './src/screens/Home.screen';
import tailwindConfig from './tailwind.config';

install({
  rem: 14,
  theme: tailwindConfig.theme,
});

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
  console.log('COOL_DOWN_OFF');
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
    </View>
  );
}
