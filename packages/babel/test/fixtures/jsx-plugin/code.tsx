// @ts-noCheck
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View className={`group flex-1 first:bg-red-200`}>
      <Text className={`${true && 'text-lg'} text-md`}>Hello World</Text>
      <Text>Hello World</Text>
      <View className='flex-1'>
        <Text className='text-lg'>Test Text</Text>
        <Text className='text-lg'>Test Text2</Text>
      </View>
    </View>
  );
}
