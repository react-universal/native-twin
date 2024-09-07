import './twin.css';
import { View } from 'react-native';
import { useLoadFonts } from '@/features/app/useLoadFonts';
import { Slot } from 'expo-router';
// import { install } from '@native-twin/core';
// import config from '../../tailwind.config'; 
 
// install(config, !__DEV__);

export default function Layout() {
  const { loaded } = useLoadFonts();
  if (!loaded) return null;
  return (
    <View className='md:bg-blue-200 xl:bg-red-200 w-screen h-screen'>
      <Slot />
    </View>
  );
}
