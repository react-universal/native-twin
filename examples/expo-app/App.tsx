import { Text } from 'react-native';
import { setup } from '@react-universal/core/install';
import { View } from '@react-universal/primitives';
import { StatusBar } from 'expo-status-bar';
import tailwindConfig from './tailwind.config';

setup(tailwindConfig);

export default function App() {
  return (
    <View
      style={{
        backgroundColor: 'black',
        flex: 1,
      }}
    >
      <View className='flex-1 items-center justify-center bg-gray-800 hover:bg-black'>
        <Text style={{ color: 'gray' }}>Open up App.tsx to start working on your app!</Text>
        <StatusBar style='light' />
      </View>
    </View>
  );
}
