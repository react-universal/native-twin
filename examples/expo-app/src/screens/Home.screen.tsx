import { useState } from 'react';
import { H1, H2, Image, Pressable, TextInput, View } from '@universal-labs/primitives';
import clsx from 'clsx';

const TextField = () => {
  const [text, setText] = useState('');
  // console.log('Text Field RENDER');
  return (
    <TextInput
      value={text}
      onChangeText={(data) => setText(data)}
      className='w-full bg-pink-400 focus:bg-white'
    />
  );
};

const testImage = require('../../assets/favicon.png');

function HomeScreen() {
  const [active, setActive] = useState(false);
  return (
    <View className='flex-1 odd:bg-white'>
      <View className='web:padding-2 hover:(bg-green-300 p-5) flex-1 items-center justify-center bg-gray-800 align-top'>
        <H1 className='font-inter-bold text-2xl text-gray-200 hover:text-gray-700'>H1 - 1</H1>
      </View>
      <View className='group -mt-[20px] flex-[2] items-center justify-center border-t-8 border-t-indigo-50 bg-slate-800 hover:bg-pink-600'>
        <H1
          className={clsx(
            ['font-inter-bold text-2xl'],
            [active ? 'text-red-800' : 'text-primary'],
          )}
        >
          Nested Hover
        </H1>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }}
        >
          <H1 className='text-gray-200'>Activate</H1>
        </Pressable>
        <Image
          source={testImage}
          resizeMode='cover'
          className='translate-x-2 overflow-hidden rounded-full border-8'
        />
        <TextField />
        <View className='mb-2 -translate-x-2 rounded-lg bg-slate-300 p-2 group-hover:bg-pink-800'>
          <H2
            suppressHighlighting
            className='font-inter-bold text-xl leading-6 text-gray-800 group-hover:text-white'
          >
            Deeply nested hover
          </H2>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
