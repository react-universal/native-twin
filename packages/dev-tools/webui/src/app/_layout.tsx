import './twin.css';
import { sheetEntriesToCss } from '@native-twin/css';
import { View } from 'react-native';
import { useLoadFonts } from '@/features/app/useLoadFonts';
import { Slot } from 'expo-router';
import { tw } from '@native-twin/core';
import { install } from '@native-twin/core';
import config from '../../tailwind.config';

(() => {
  if (typeof window === 'undefined') {
    console.log('ON_SERVER: ', ((tw.target as any) ?? []).length);
    return;
  }
  console.log('ON_CLIENT: ', ((tw.target as any) ?? []).length);
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.setAttribute('data-expo-loader', 'css');
  style.setAttribute('data-expo-css-hmr', 'node_modules_.cache_native-twin_twin.out.css');
  style.setAttribute('data-native-twin', '');
  head.appendChild(style);
  const css = sheetEntriesToCss(tw.target as any[]);
  // style.styleSheet.cssText = css;
  style.appendChild(document.createTextNode(css));
})();

export default function Layout() {
  const { loaded } = useLoadFonts();
  if (!loaded) return null;
  return (
    <View className='bg-gray xl:bg-red-200 w-screen h-screen'>
      <Slot />
    </View>
  );
}

install(config);
