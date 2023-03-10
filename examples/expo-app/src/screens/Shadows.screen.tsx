import { H2, View } from '@universal-labs/primitives';

const Shadows = () => {
  return (
    <View className='flex-1 bg-white'>
      <View className='aspect-square shadow-lg'>
        <H2>Square</H2>
      </View>
      <View className='aspect-video bg-gray-500'>
        <H2>Video</H2>
      </View>
    </View>
  );
};

export { Shadows };
