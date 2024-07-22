import { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');

function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1 bg-black'>
      <View
        className={`
          flex-1 items-center justify-center md:border-3
          hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-green))
          ios:(p-16 border-black border-2 dark:(bg-blue-500))
          android:(p-14 border-green-200 border-2 bg-gray-800 dark:(bg-purple-500))
          md:(m-10)
          bg-red-500
        `}
      >
        <Button size='large' />
        <View className='bg-white shadow-md rounded-xl p-2'>
          <Text
            className={`
              text(center xl primary)
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
          bg-gray-800 hover:bg-pink-600
        `}
      >
        <Text
          className={`
            font-inter-bold text-2xl capitalize
            ${active ? 'text-red-800' : 'text-primary'}
          `}
        >
          Nested Hover22222
        </Text>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }}
        >
          <Text className='text-gray-200  text-3xl'>Activate</Text>
        </Pressable>
        <Image
          source={testImage}
          resizeMode='cover'
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
