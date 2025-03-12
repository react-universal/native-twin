// @ts-noCheck
import { View } from 'react-native';
import { Button } from './code-i';

export default function App() {
  return (
    <View className={`group flex-1 shadow-md border-1 translate-x-2 first:bg-red-200`}>
      <Button size='small' />
      {/* <Text>Hello World</Text>
      <Text>Hello World</Text>
      <View className='flex-1 first:bg-blue-200'>
        <Text className='text-lg'>Test Text</Text>
        <Text className='text-lg'>Test Text2</Text>
      </View> */}
    </View>
  );
}
