import { Text, View } from 'react-native';

const AspectRatio = () => {
  return (
    <View className='flex-1'>
      <Text>Aspect Ratio</Text>
      <View className='aspect-square flex-1 bg-white'>
        <Text>Square</Text>
      </View>
      <View className='aspect-video flex-1 bg-gray-500'>
        <Text>Video</Text>
      </View>
      <View className='aspect-auto flex-1 bg-gray-800'>
        <Text className='text-gray-200'>Auto</Text>
      </View>
    </View>
  );
};

export { AspectRatio };
