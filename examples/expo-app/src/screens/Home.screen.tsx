import { H1, View } from '@react-universal/primitives';

function HomeScreen() {
  return (
    <View className='flex-1' key='cc-1'>
      <View
        key='cc-2'
        className='flex-1 items-center justify-center bg-slate-900 hover:bg-slate-300'
      >
        <H1 key='cc-2-H1' className='text-gray-200 hover:text-gray-900'>
          H1 - 1
        </H1>
      </View>
      <View key='cc-3' className='flex-1 items-center justify-center hover:bg-slate-300'>
        <H1 key='cc-3-H1' className='text-gray-200 hover:text-gray-900'>
          H1 - 2
        </H1>
      </View>
    </View>
  );
}

export { HomeScreen };
