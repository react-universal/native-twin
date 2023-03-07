import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import { Pressable } from '@universal-labs/primitives';
import { Span } from '@universal-labs/primitives';
import { IButtonVariantsProps, buttonStyles, buttonTextStyles } from './variants';

type IButtonProps = {
  isLoading?: boolean;
  children: ReactNode;
  variant?: IButtonVariantsProps['variant'];
  layout?: IButtonVariantsProps['layout'];
  size?: IButtonVariantsProps['size'];
  isDisabled?: boolean;
} & Omit<ComponentProps<typeof Pressable>, 'tw'>;

export const Button = ({
  children,
  onPress,
  isLoading = false,
  isDisabled,
  variant,
  size,
  layout,
  className,
  ...props
}: IButtonProps) => {
  const buttonClass = buttonStyles({
    variant,
    size,
    layout,
    isDisabled: isDisabled || isLoading,
    className,
  });
  const textClass = buttonTextStyles({
    variant,
  });
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole='button'
      className={buttonClass}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : typeof children === 'string' ? (
        <Span accessibilityRole='text' className={textClass}>
          {children}
        </Span>
      ) : (
        children
      )}
    </Pressable>
  );
};
