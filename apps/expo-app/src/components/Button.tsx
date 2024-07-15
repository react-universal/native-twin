import { Text, Pressable, PressableProps } from 'react-native';
import { VariantProps, createVariants } from '@native-twin/styled';

// css`bg`;
// styled('')``

const buttonVariants = createVariants({
  base: 'py-5 m-1 rounded-md items-center justify-center ',
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

export const Button = (props: ButtonProps) => {
  const className = buttonVariants(props);
  return (
    <Pressable className={className}>
      <Text>asd</Text>
    </Pressable>
  );
};
