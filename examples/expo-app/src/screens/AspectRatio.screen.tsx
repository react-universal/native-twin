import { H1, H2, View } from '@universal-labs/styled';

const AspectRatio = () => {
  return (
    <View className='flex-1'>
      <H1>Aspect Ratio</H1>
      <View className='aspect-square flex-1 bg-white'>
        <H2>Square</H2>
      </View>
      <View className='aspect-video flex-1 bg-gray-500'>
        <H2>Video</H2>
      </View>
      <View className='aspect-auto flex-1 bg-gray-800'>
        <H2 className='text-gray-200'>Auto</H2>
      </View>
    </View>
  );
};

export { AspectRatio };
