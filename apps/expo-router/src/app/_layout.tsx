import { View } from 'react-native';
import { Slot } from 'expo-router';
import { setup } from '@native-twin/core';
import tailwindConfig from '../../tailwind.config';
import { useLoadFonts } from '../hooks/useLoadFonts';

setup(tailwindConfig);

export default function Layout() {
  const { loaded } = useLoadFonts();
  if (!loaded) return null;
  return (
    <View className='bg-gray w-screen h-screen'>
      <Slot />
    </View>
  );
}
