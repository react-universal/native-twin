import './twin.css';
import { sheetEntriesToCss, SheetEntry } from '@native-twin/css';
import { createElement, useState } from 'react';
import { View } from 'react-native';
import { useLoadFonts } from '@/features/app/useLoadFonts';
import { Slot } from 'expo-router';
import Head from 'expo-router/head';
import { install, tw } from '@native-twin/core';
import { getNonce } from '@native-twin/helpers';
import config from '../../tailwind.config';

install(config, !__DEV__);
export default function Layout() {
  const { loaded } = useLoadFonts();
  // if (!loaded) return null;
  console.log('TARGET: ', tw.target);
  return (
    <View className='bg-red xl:bg-red-200 w-screen h-screen'>
      <Slot />
    </View>
  );
}
