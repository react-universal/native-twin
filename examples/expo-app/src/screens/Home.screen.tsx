import { useState } from 'react';
import styled from '@universal-labs/styled';
import clsx from 'clsx';
import {
  FullView,
  H1,
  H2,
  Image,
  Pressable,
  TextInput,
  View,
} from '../components/common/View';
css``;
styled('')``
const TextField = () => {
  const [text, setText] = useState('');
  return (
    <TextInput
      value={text}
      onChangeText={(data) => setText(data)}
      className='bg-pink-400 focus:bg-white'
    />
  );
};

const testImage = require('../../assets/favicon.png');

const ExoticView = styled(View)`
  ${clsx(
    'flex-1',
    'items-center justify-center md:border-3',
    'hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-black))',
    'ios:(p-14 bg-rose-200 border-white border-2)',
    'android:(p-14 border-green-200 border-2 bg-gray-200)',
  )}
`;
function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <FullView>
      <ExoticView>
        <H1
          className={clsx('text(center 2xl primary)', 'font-inter-bold hover:text-gray-700')}
        >
          H1 - 1
        </H1>
      </ExoticView>
      <View
        className={clsx(
          'group',
          'flex-[2]',
          'bg-gray-800 hover:bg-pink-600',
          'items-center justify-center',
        )}
      >
        <H1
          className={clsx(
            ['font-inter-bold text-2xl capitalize'],
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
          className='-translate-x-[10vw] rounded-full border-1'
        />
        <TextField />
        <View
          className={clsx(
            '-top-1 -translate-x-2',
            'mb-2 rounded-lg bg-gray-300 p-2',
            'group-hover:bg-pink-800',
          )}
        >
          <H2
            suppressHighlighting
            className='font-inter-bold rotate-6 text-xl text-gray-800 group-hover:text-white -mt-2'
          >
            Deeply nested hover
          </H2>
        </View>
      </View>
    </FullView>
  );
}

export { HomeScreen };
