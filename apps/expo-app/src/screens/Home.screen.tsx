import { useState } from 'react';
import { Text, Image, Pressable, View } from 'react-native';
import { useAssets } from 'expo-asset';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

function HomeScreen() {
  const [active, setActive] = useState(true);
  const [testImage] = useAssets([require('../../assets/favicon.png')]);
  console.log('ASSET: ', testImage);
  return (
    <View className='flex-1'>
      <View className={`flex-1 items-center justify-center group bg-yellow-800`}>
        <Button size='large' />
        <View className='shadow-xl rounded-2xl p-2 group-focus:bg-purple-500'>
          <Text
            className={`
              text(center white)
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
          bg-blue-800 hover:bg-red-600
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
          <Text className='text-red-200 text-sm'>Activate</Text>
        </Pressable>
        {testImage && !!testImage[0] && (
          <Image
            src={testImage[0] as any as string}
            resizeMode='cover'
            style={{
              width: 100,
              height: 100,
            }}
            className='rounded-full border-1'
          />
        )}
        <TextField />
        <View
          className={`
            -top-1 -translate-x-1
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
