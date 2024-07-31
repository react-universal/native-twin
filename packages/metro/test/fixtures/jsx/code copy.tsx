// @ts-noCheck
import { useState } from 'react';
import { Text, Image, Pressable, View, PressableProps } from 'react-native';
import { VariantProps, createVariants } from '@native-twin/styled';
import { TextField } from '../components/TextField';

const testImage = require('../../assets/favicon.png');

const ChildProp = () => {
  return (
    <View className='bg-black last:text-lg'>
      <Text className='text-blue'>Text1</Text>
      <Text className='text-red'>Text2</Text>
    </View>
  )
}

const buttonVariants = createVariants({
  base: 'py-5 m-1 rounded-md items-center justify-center',
  variants: {
    variant: {
      primary: 'bg-blue-200',
      secondary: 'bg-white',
    },
    size: {
      large: 'w-40',
      small: 'w-4',
    },
    isDisable: {
      true: 'opacity-30',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type ButtonProps = ButtonVariantProps & PressableProps;

const Button = (props: ButtonProps) => {
  return (
    <Pressable className={buttonVariants(props)}>
      <Text>asd</Text>
    </Pressable>
  );
};

function HomeScreen() {
  const [active, setActive] = useState(true);
  return (
    <View className='flex-1 bg-red'>
      <View
        className={`
          flex-1 items-center justify-center md:border-2
          hover:bg-green-600 bg-red-500
          first:bg-purple-600
        `}
        debug
      >
        <View className='shadow-md rounded-xl p-2'>
          <Text
            className={`
              text(center xl primary)
              font-inter-bold hover:text-gray-700
              `}
          >
            Hello World
          </Text>
        </View>
        <Button size='large' />
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
          resizeMode='contain'
          resizeMethod='resize'
          className='-translate-x-[10vw] rounded-full border-1 w-5 h-5'
          style={{
            width: 100,
            height: 100,
          }}
        />
        <TextField />
        <View
          className={`
            -top-1 -translate-x-2
            mb-2 rounded-lg bg-gray-300 p-2
            group-hover:bg-pink-800
          `}
          debug
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
