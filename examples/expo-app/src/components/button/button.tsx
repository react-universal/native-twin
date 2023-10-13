import type { ReactNode } from 'react';
import { PressableProps } from 'react-native';
import { createVariants, VariantProps, Pressable, Strong } from '@universal-labs/styled';
import { Spinner } from '../spinner';

const StyledButton = createVariants({
  variants: {
    variant: {
      primary: 'bg-primary rounded-xl hover:bg-red-200',
      secondary: 'bg-gray-300',
      primaryDark: 'bg-weathermatic-500',
    },
    size: {
      default: 'w-full h-14',
      small: 'h-10',
      bigger: `my-3 mx-2
        shadow-md rounded-3xl
        dark:bg-weathermatic-500
        desktop:w-44 desktop:h-44
        w-40 h-36`,
    },
    isDisabled: {
      true: 'bg-gray-400 hover:opacity-100',
      false: '',
    },
    layout: {
      default: 'justify-center items-center',
      col: 'items-center justify-between',
    },
  },
  defaultVariants: {
    variant: 'primary',
    layout: 'default',
    size: 'default',
  },
});

const strongVariants = createVariants({
  variants: {
    variant: {
      primary: 'text-gray-100 text-center text-xl font-bold',
      secondary: 'text-weathermatic-500',
      primaryDark: 'text-gray-200',
    },
    isDisabled: {
      true: 'text-gray-500',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

type IButtonProps = {
  isLoading?: boolean;
  children: ReactNode;
  isDisabled?: boolean;
  textClassName?: string;
} & PressableProps &
  VariantProps<typeof StyledButton>;

export const Button = ({
  children,
  onPress,
  isLoading = false,
  isDisabled,
  textClassName,
  ...props
}: IButtonProps) => {
  return (
    <Pressable
      className={StyledButton(props)}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole='button'
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : typeof children === 'string' ? (
        <Strong
          accessibilityRole='text'
          className={strongVariants({
            ...props,
            className: textClassName,
          })}
        >
          {children}
        </Strong>
      ) : (
        children
      )}
    </Pressable>
  );
};
