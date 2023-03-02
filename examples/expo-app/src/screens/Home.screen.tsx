import { useEffect, useRef } from 'react';
import { H1, View } from '@react-universal/primitives';

function HomeScreen() {
  const ref = useRef<typeof View>();
  useEffect(() => {
    if (ref.current) {
      console.log('HOME_REF: ', ref);
    }
  }, []);
  return (
    <View ref={ref} className='flex-1'>
      <View className='flex-1 items-center justify-center bg-slate-900/50 align-top hover:bg-slate-300'>
        <H1 className='text-gray-200 hover:text-gray-700'>H1 - 1</H1>
      </View>
      <View className='bg-slate-80 group flex-[2] items-center justify-center border-t-8 border-t-indigo-50 hover:bg-slate-500'>
        <H1 className='text-gray-200 group-hover:text-gray-900'>Nested Hover</H1>
        <View className='rounded-lg bg-slate-300'>
          <H1 suppressHighlighting className='text-gray-800 hover:text-gray-300'>
            Deeply nested hover
          </H1>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
