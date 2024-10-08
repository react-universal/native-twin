import { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');
function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1 first:bg-yellow-600'>
      <View className={`flex-1 items-center justify-center group`}>
        <View className='shadow-xl bg-red-300 rounded-2xl p-2 group-focus:bg-green-500 first:bg-purple-200'>
          <Text
            className={`
              text(center white xl)
              font-inter-bold hover:text-gray-700
              `}
          >
            Hello World
          </Text>
        </View>
        <Button size='small' />
      </View>
      <View
        className={`
          group
          flex-[2] items-center justify-center
          bg-blue-800 hover:bg-pink-600
        `}
      >
        <Text
          className={`
            font-inter-bold text-5xl capitalize
            ${active ? 'text-green-800' : 'text-yellow-400'}
          `}
        >
          Nested Hover22222
        </Text>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }}
        >
          <Text className='text-blue-200 text-sm'>Activate</Text>
        </Pressable>
        <Image
          src={testImage}
          resizeMode='cover'
          style={{
            width: 100,
            height: 100,
          }}
          className='rounded-full border-1'
        />
        <TextField />
        <View
          className={`
            -top-1 -translate-x-1
            mb-2 rounded-lg bg-gray-300 p-3
            group-hover:bg-pink-500
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
