import { useMemo, useState } from 'react';
import { H1, H2, Image, Pressable, TextInput, View } from '@universal-labs/primitives';
import clsx from 'clsx';

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

const testImage = require('../../assets/favicon.png');

function HomeScreen() {
  const [active, setActive] = useState(false);
  const nestedClass = useMemo(() => {
    return clsx(['font-inter-bold text-2xl'], [active ? 'text-red-800' : 'text-primary']);
  }, [active]);
  return (
    <View className='flex-1'>
      <View className='web:padding-2 flex-1 items-center justify-center bg-pink-800/30 align-top hover:bg-green-300'>
        <H1 className='font-inter-bold text-2xl text-gray-200 hover:text-gray-700'>H1 - 1</H1>
      </View>
      <View className='group flex-[2] items-center justify-center border-t-8 border-t-indigo-50 bg-slate-800 hover:bg-pink-600'>
        <H1 className={nestedClass}>Nested Hover</H1>
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
          className='overflow-hidden rounded-full border-8'
        />
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
