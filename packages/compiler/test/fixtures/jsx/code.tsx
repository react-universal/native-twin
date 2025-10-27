// @ts-noCheck
import { View } from 'react-native';
import { Button } from './code-i';

export default function App() {
  return (
    <View className={`group flex-1 hover:bg-red shadow-md border-1 translate-x-2 rotate-1 first:bg-red-200 last:bg-blue-200`}>
      <Button size='small' />
       <Text className='px-2 group-hover:bg-green'>Hello World</Text>
    </View>
  );
}
