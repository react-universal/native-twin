// @ts-noCheck
import { View, Text } from 'react-native';
export default function App() {
  return <View className={jsxMacro`flex-1`}>
      <JSXMacro>
        <Text className='text-lg'>Hello World</Text>
      </JSXMacro>
      <Text className={`
        flex-1 items-center justify-center md:border-3
        hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-purple))
        ios:(p-14 bg-rose-200 border-black border-2 dark:(bg-blue-500))
        android:(p-14 border-green-200 border-2 bg-gray-800 dark:(bg-purple-500))
        md:(m-10)
        ${true && 'text-xl'}
        `}>
        Hello World
      </Text>
      <View className='flex-1' />
    </View>;
}