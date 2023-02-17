import { H1, View } from '@react-universal/primitives';

function HomeScreen() {
  return (
    <View className='flex-1' key='cc-1'>
      <View
        key='cc-2'
        className='flex-1 items-center justify-center bg-slate-900 hover:bg-slate-300'
      >
        <H1 key='cc-2-H1' className='text-gray-200'>
          H1 - 1
        </H1>
      </View>
      <View
        key='cc-3'
        className='group flex-1 items-center justify-center bg-slate-800 hover:bg-slate-500'
      >
        <H1 key='cc-3-H1' className='text-gray-200 group-hover:text-gray-900'>
          Nested Hover
        </H1>
        <View className='bg-slate-300 hover:bg-slate-800'>
          <H1 className='text-gray-800 group-hover:text-gray-300'>Deeply nested hover</H1>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
