import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { create } from '@react-universal/tailwind-plugin/build/internalStore';
import { StatusBar } from 'expo-status-bar';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from './tailwind.config';

const config = resolveConfig(tailwindConfig);
const tailwind = create(config);

export default function App() {
  const style = tailwind`flex-1 items-center justify-center bg-gray-700`;
  console.log('STYLE: ', style);
  return (
    <View className='flex-1 items-center justify-center bg-gray-700' style={style}>
      <Text className='text-center text-2xl text-green-500' style={{ color: 'gray' }}>
        Open up App.tsx to start working on your app!
      </Text>
      <StatusBar style='light' />
    </View>
  );
}
