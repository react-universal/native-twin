import { useState } from 'react';
import { H1, H2, Image, Pressable, TextInput, View } from '@native-twin/styled';

// css`bg`;
// styled('')``

const TextField = () => {
  const [text, setText] = useState('');
  return (
    <TextInput
      value={text}
      onChangeText={(data) => setText(data)}
      className='bg-pink-400 focus:bg-white text(base black 5xl md:6xl)'
    />
  );
};

const testImage = require('../../assets/favicon.png');

function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1'>
      <View
        className={`flex-1
    items-center justify-center md:border-3
    hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-black))
    ios:(p-14 bg-rose-200 border-white border-2)
    android:(p-14 border-green-200 border-2 bg-gray-50)`}
      >
        <View className='bg-white shadow-md rounded-xl p-2'>
          <H1
            className={`
              text(center base primary)
              font-inter-bold hover:text-gray-700
            `}
          >
            H1 - 1
          </H1>
        </View>
      </View>
      <View
        className={`
          group
          flex-[2]
          bg-gray-800 hover:bg-pink-600
          items-center justify-center
        `}
      >
        <H1
          className={`
          font-inter-bold text-2xl capitalize
          ${active ? 'text-red-800' : 'text-primary'}
          `}
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
          className={`
            -top-1 -translate-x-2
            mb-2 rounded-lg bg-gray-300 p-2
            group-hover:bg-pink-800
          `}
        >
          <H2
            suppressHighlighting
            className='font-inter-bold rotate-6 text-xl text-gray-800 group-hover:text-white -mt-2'
          >
            Deeply nested hover
          </H2>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
