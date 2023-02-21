import { H2, View } from '@react-universal/primitives';

const PrimitivesScreen = () => {
  return (
    <View className='flex-1 flex-row flex-wrap gap-2 gap-x-2 gap-y-2'>
      <View>
        <H2>View</H2>
      </View>
      <View>
        <H2>Text</H2>
      </View>
    </View>
  );
};

export { PrimitivesScreen };
