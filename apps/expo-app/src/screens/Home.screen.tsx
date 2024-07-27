import { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');

function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1 bg-red'>
      <View
        className={`flex-1 items-center justify-center bg-cyan-500`}
        // debug
      >
        <Button size='large' />
        <View className='bg-red-200 shadow-xl rounded-2xl p-2'>
          <Text
            className={`
              text(center red-500)
              font-inter-bold hover:text-gray-700
            `}
          >
            Hello World
          </Text>
        </View>
      </View>
      <View
        className={`
          group
          flex-[2] items-center justify-center
          bg-gray-800 hover:bg-red-600
        `}
      >
        <Text
          className={`
            font-inter-bold text-5xl capitalize
            ${active ? 'text-purple-800' : 'text-red-400'}
          `}
        >
          Nested Hover22222
        </Text>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }}
        >
          <Text className='text-gray-200 text-sm'>Activate</Text>
        </Pressable>
        <Image
          source={testImage}
          resizeMode='contain'
          resizeMethod='resize'
          className='-translate-x-[10vw] rounded-full border-1 w-5 h-5'
        />
        <TextField />
        <View
          className={`
            -top-1 -translate-x-2
            mb-2 rounded-lg bg-gray-300 p-2
            group-hover:bg-pink-800
          `}
        >
          <Text
            suppressHighlighting
            className='font-inter-bold rotate-6 text-2xl text-gray-800 group-hover:text-white -mt-2'
          >
            Deeply nested hover
          </Text>
        </View>
      </View>
    </View>
  );
}

export { HomeScreen };
