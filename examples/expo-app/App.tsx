import { Text } from 'react-native';
import { setup } from '@react-universal/core/install';
import { View } from '@react-universal/primitives';
import { StatusBar } from 'expo-status-bar';
import { enableMapSet } from 'immer';
import tailwindConfig from './tailwind.config';

enableMapSet();

setup(tailwindConfig);
export default function App() {
  const i = 23;
  return (
    <View
      className={`
    flex-1 
    items-center 
    justify-center bg-gray-800 hover:bg-gray-200
    ${i > 23 && 'bg-slate-100'}
    `}
    >
      <Text style={{ color: 'gray' }}>Open up App.tsx to start working on your app!</Text>
      <StatusBar style='light' />
    </View>
  );
}
