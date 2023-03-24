import { H1, H2, View } from '@universal-labs/primitives';

function HomeScreen() {
  return (
    <View className='flex-1 divide-x-2'>
      <View className='flex-1 items-center justify-center bg-slate-900 align-top hover:bg-slate-300'>
        <H1 className='text-gray-200 hover:text-gray-700'>H1 - 1</H1>
      </View>
      <View className='bg-slate-80 group flex-[2] items-center justify-center border-t-8 border-t-indigo-50 hover:bg-gray-600'>
        <H1 className='text-primary hover:text-gray-900'>Nested Hover</H1>
        <View className='mb-2 translate-x-10 rounded-lg bg-slate-300 group-hover:bg-gray-800'>
          <H2 suppressHighlighting className='text-gray-800 group-hover:text-gray-300'>
            Deeply nested hover
          </H2>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
