import { StrictMode, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { setup } from '@native-twin/core';
import { useLoadFonts } from './src/hooks/useLoadFonts';
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
      <View
        className='flex-1 bg-red group hover:(bg-white) justify-center items-end last:text-pink'
        // // @ts-expect-error
        // onPressIn={() => setIsReady((p) => !p)}
      >
        <Text className='text(white 5xl) group-hover:(text-gray)'>asd</Text>
        <Text className='text(black 5xl) hover:(text-green)'>asd</Text>
      </View>
    </StrictMode>
  );
}
