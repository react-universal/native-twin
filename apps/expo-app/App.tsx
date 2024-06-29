import { StrictMode, useEffect, useState } from 'react';
import { setup } from '@native-twin/core';
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
    <StrictMode>
      <HomeScreen />
    </StrictMode>
  );
}
