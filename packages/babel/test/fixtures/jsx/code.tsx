// @ts-noCheck
import {View,Text} from 'react-native';

export default function App() {
  return (
    <View className='flex-1'>
      <Text className='text-lg'>Hello World</Text>
      <Text className={`
        text-lg
        ${true && 'text-xl'}
        `}>Hello World</Text>
    </View>
  )
}