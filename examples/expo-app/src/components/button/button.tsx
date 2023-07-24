import type { ReactNode } from 'react';
import styled, { PropsFrom } from '@universal-labs/styled';
import { Spinner } from '../spinner';

const StyledButton = styled.Pressable({
  variants: {
    variant: {
      primary: 'bg-primary rounded-xl',
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

const Strong = styled.Strong({
  variants: {
    variant: {
      primary: 'text-gray-100 text-center',
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
  className?: string;
} & PropsFrom<typeof StyledButton>;

export const Button = ({
  children,
  onPress,
  isLoading = false,
  isDisabled,
  textClassName,
  className,
  ...props
}: IButtonProps) => {
  return (
    // @ts-expect-error
    <StyledButton
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole='button'
      className={className}
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : typeof children === 'string' ? (
        // @ts-expect-error
        <Strong accessibilityRole='text' className={textClassName}>
          {children}
        </Strong>
      ) : (
        children
      )}
    </StyledButton>
  );
};
