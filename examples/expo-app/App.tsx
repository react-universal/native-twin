import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { setup } from '@universal-labs/native-twin';
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
    <View className='flex-1 bg-black justify-center items-center'>
      <Text className='text(white 5xl)'>asd</Text>
    </View>
  );
}
