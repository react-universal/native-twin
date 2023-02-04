import { Text } from 'react-native';
import '@react-universal/core/install';
import { View } from '@react-universal/primitives';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View className='flex-1 items-center justify-center bg-gray-800 hover:bg-black'>
      <Text style={{ color: 'gray' }}>Open up App.tsx to start working on your app!</Text>
      <StatusBar style='light' />
    </View>
  );
}
