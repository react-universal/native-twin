import { H1, View } from '@react-universal/nativewind-primitives';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View className='flex-1 items-center justify-center bg-gray-700'>
      <H1 className='text-center text-2xl text-green-500'>
        Open up App.tsx to start working on your app!
      </H1>
      <StatusBar style='light' />
    </View>
  );
}
