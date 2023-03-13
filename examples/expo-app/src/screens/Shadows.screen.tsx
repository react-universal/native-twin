import { H2, View } from '@universal-labs/primitives';

const Shadows = () => {
  return (
    <View className='flex-1 flex-row flex-wrap gap-5 bg-white p-10'>
      <View className='rounded-lg bg-white p-3 shadow-md'>
        <H2>Square</H2>
      </View>
      <View className='rounded-lg bg-white p-3 shadow-md'>
        <H2>Square</H2>
      </View>
    </View>
  );
};

export { Shadows };
