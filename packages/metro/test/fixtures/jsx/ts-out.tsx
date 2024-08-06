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
        <View className='flex-1 -translate-x-2 w-[10vw]'>
            <View
                className={`
          flex-1
          bg-red-500
          first:bg-purple-600
        `}
                debug
            >
                <View className='p-2 !bg-green-800'>
                    <Text
                        className={`
              text(center xl primary)
              hover:text-gray-700
              `}
                    >
                        Hello World
                    </Text>
                </View>
            </View>
            <View
                className={`
          group
          flex-[2]
          !bg-green-800
          bg-gray-500
          hover:bg-pink-600
        `}
            >
                <Text
                    className={`
            text-2xl
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
                    <Text className='text-gray-200'>Activate</Text>
                </Pressable>
                <View
                    className={`
            -top-1
            group-hover:bg-pink-800
          `}
                    debug
                >
                    <Text
                        suppressHighlighting
                        className='text-gray-800 group-hover:text-white'
                    >
                        Deeply nested hover
                    </Text>
                </View>
            </View>
        </View>
    );
}

export { HomeScreen };
