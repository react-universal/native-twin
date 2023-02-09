import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { setup } from '@react-universal/core/install';
import { View } from '@react-universal/primitives';
import { enableMapSet } from 'immer';
import { Index } from './src';
import tailwindConfig from './tailwind.config';

enableMapSet();

setup(tailwindConfig);
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className='flex-1'>
        <Index />
      </View>
    </GestureHandlerRootView>
  );
}
