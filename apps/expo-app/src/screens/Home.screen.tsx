import { useState } from 'react';
import {
  Text,
  Image,
  Pressable,
  TextInput,
  View,
  PressableProps,
  Dimensions,
} from 'react-native';
import { VariantProps, createVariants } from '@native-twin/styled';

// css`bg`;
// styled('')``

const { width: SCREEN_W } = Dimensions.get('window');

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
  const className = buttonVariants(props);
  return (
    <Pressable className={className}>
      <Text>asd</Text>
    </Pressable>
  );
};

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
        className={`
          flex-1 items-center justify-center md:border-3
          hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-black))
          ios:(p-14 bg-rose-200 border-black border-2 dark:(bg-blue-500))
          android:(p-14 border-green-200 border-2 bg-gray-50 dark:(bg-purple-500))
          md:(m-10) bg-red-500
        `}
      >
        <Button size='large' />
        <View className='bg-white shadow-md rounded-xl p-2'>
          <Text
            className={`
              text(center base primary)
              font-inter-bold hover:text-gray-700
            `}
          >
            {`WIDTH: ${SCREEN_W}`}
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
          Nested Hover
        </Text>
        <Pressable
          onPressIn={() => {
            setActive((prevState) => !prevState);
          }}
        >
          <Text className='text-gray-200 text-3xl'>Activate</Text>
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
            group-hover:bg-pink-800s
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
