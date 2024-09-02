// import './twin.css';
// import { sheetEntriesToCss } from '@native-twin/css';
import { View } from 'react-native';
import { useLoadFonts } from '@/features/app/useLoadFonts';
import { Slot } from 'expo-router';
// import { tw } from '@native-twin/core';
// import { install } from '@native-twin/core';
// import config from '../../tailwind.config';

export default function Layout() {
  const { loaded } = useLoadFonts();
  if (!loaded) return null;
  return (
    <View className='bg-gray xl:bg-red-200 w-screen h-screen'>
      <Slot />
    </View>
  );
}

// install(config);
