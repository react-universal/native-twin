import { Text, View } from 'react-native';

const ShadowsScreen = () => {
  return (
    <View className='flex-1 flex-row flex-wrap gap-5 bg-white p-10'>
      <View className='rounded-lg bg-white p-3 shadow-md'>
        <Text>Square</Text>
      </View>
      <View className='rounded-lg bg-white p-3 shadow-md'>
        <Text>Square</Text>
      </View>
    </View>
  );
};

export { ShadowsScreen };
