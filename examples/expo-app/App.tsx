import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { install } from '@universal-labs/styled';
import { Button } from './src/components/button';
import { useLoadFonts } from './src/hooks/useLoadFonts';
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
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button variant='primary'>asd</Button>
      <Button variant='secondary'>asd</Button>
    </View>
  );
}
