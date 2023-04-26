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
      className='min-w-[25vw] bg-pink-400 focus:bg-white'
    />
  );
};

const testImage = require('../../assets/favicon.png');

function HomeScreen() {
  const [active, setActive] = useState(false);
  return (
    <View className='h-[10vh] flex-1 odd:bg-black'>
      <View className='hover:(bg-red-300 web:(bg-blue-600) ios:(bg-pink-600) android:(bg-black)) flex-1 items-center justify-center'>
        <H1 className='text(center 2xl indigo-600 capitalize) font-inter-bold hover:text-gray-700'>
          H1 - 1
        </H1>
      </View>
      <View className='text-primary group -mt-[20px] flex-[2] items-center justify-center border-t-8 border-indigo-50 bg-gray-800 hover:bg-pink-600'>
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
        <View className='mb-2 -translate-x-2 rounded-lg bg-gray-300 p-2 group-hover:bg-pink-800'>
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
