import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { NativeModules } from 'react-native';
import { setup } from '@react-universal/core/install';
import { enableMapSet } from 'immer';
import { Index } from './src';
import tailwindConfig from './tailwind.config';

if (__DEV__) {
  NativeModules.DevSettings.setIsDebuggingRemotely(true);
}

enableMapSet();

setup(tailwindConfig);
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Index />
    </GestureHandlerRootView>
  );
}
