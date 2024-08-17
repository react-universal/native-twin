import { View } from 'react-native';
import { useLoadFonts } from '@/hooks/useLoadFonts';
import { Slot } from 'expo-router';
import { install } from '@native-twin/core';
import config from '../../tailwind.config';

export default function Layout() {
  const { loaded } = useLoadFonts();
  if (!loaded) return null;
  return (
    <View className='bg-gray w-screen h-screen'>
      <Slot />
    </View>
  );
}

install(config);
