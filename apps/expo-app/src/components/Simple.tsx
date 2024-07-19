import { Text, View } from 'react-native';

export const SimpleComponent = () => {
  return (
    <View className='group flex-1 bg-black items-center justify-center'>
      <View className='hover:m-4 bg-white p-8'>
        <Text className='font-inter-bold text-sm text-red'>Text-333</Text>
      </View>
      <View className='m-2 rounded-lg bg-red-500 p-8'>
        <Text className='text-sm text-gray-800'>Text-2</Text>
      </View>
    </View>
  );
};
