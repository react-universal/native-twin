// @ts-noCheck
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View className='flex-1'>
      <Text className='text-lg' isFirstChild={true} ord={0}>Hello World</Text>
      <Text
        className={`
        flex-1 items-center justify-center md:border-3
        hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-purple))
        ios:(p-14 bg-rose-200 border-black border-2 dark:(bg-blue-500))
        android:(p-14 border-green-200 border-2 bg-gray-800 dark:(bg-purple-500))
        md:(m-10)
        ${true && 'text-xl'}
        `} ord={1}
      >
        Hello World
      </Text>
      <View className='flex-1' ord={2} isLastChild={true} />
    </View>
  );
}
