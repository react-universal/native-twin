import { H1, View } from '@react-universal/primitives';

function HomeScreen() {
  return (
    <View className='flex-1'>
      <View className='flex-1 items-center justify-center bg-slate-900 hover:bg-slate-300'>
        <H1 className='text-gray-200 hover:text-gray-900'>sad</H1>
      </View>
      <View className='flex-1 items-center justify-center hover:bg-slate-300'>
        <H1 className='text-gray-200 hover:text-gray-900'>sad</H1>
      </View>
    </View>
  );
}

export { HomeScreen };
