import { useState } from 'react';
import { H1, H2, TextInput, View } from '@universal-labs/primitives';

const TextField = () => {
  const [text, setText] = useState('');
  return (
    <TextInput
      value={text}
      onChangeText={(data) => setText(data)}
      className='w-full bg-pink-400 focus:bg-white'
    />
  );
};
function HomeScreen() {
  return (
    <View className='flex-1 odd:bg-pink-800'>
      <View className='web:padding-2 flex-1 items-center justify-center align-top hover:bg-green-300'>
        <H1 className='font-inter-bold text-2xl text-gray-200 hover:text-gray-700'>H1 - 1</H1>
      </View>
      <View className='bg-slate-80 group flex-[2] items-center justify-center border-t-8 border-t-indigo-50 hover:bg-pink-600'>
        <H1 className='text-primary font-inter-bold text-2xl focus:text-gray-900'>
          Nested Hover
        </H1>
        <TextField />
        <View className='mb-2 translate-x-10 rounded-lg bg-slate-300 p-2 group-hover:bg-pink-800'>
          <H2
            suppressHighlighting
            className='font-inter-bold text-xl text-gray-800 group-hover:text-gray-300'
          >
            Deeply nested hover
          </H2>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
