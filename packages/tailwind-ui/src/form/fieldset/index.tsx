import { forwardRef, ReactNode } from 'react';
import { Platform } from 'react-native';
import { View, ViewProps } from '@universal-labs/primitives';
import { MotiText } from 'moti';
import type { FieldError } from 'react-hook-form';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import colors from 'tailwindcss/colors';
import { FieldErrorMessage } from '../error-message';

interface IFieldSetProps extends ViewProps {
  label: string;
  isInvalid: boolean;
  hasValue: boolean;
  focused: SharedValue<number>;
  children: ReactNode;
  error?: FieldError;
  className?: string;
  isDisabled?: boolean;
  small?: boolean;
  multiline?: boolean;
}

const FieldSet = forwardRef(function FieldSet(
  {
    focused,
    isInvalid,
    label,
    hasValue,
    children,
    error,
    className,
    isDisabled = false,
    multiline = false,
    ...restProps
  }: IFieldSetProps,
  ref,
) {
  return (
    <View
      ref={ref}
      className={`
        relative my-2 w-full items-start
        justify-center
        overflow-hidden
        rounded-xl
        bg-gray-50
        ${multiline ? 'h-auto' : 'h-16'}
        ${isInvalid ? 'border-error border-[1px]' : ''}
        ${isDisabled ? 'opacity-70' : ''}
        ${className}
      `}
      pointerEvents={Platform.OS === 'web' ? 'none' : 'auto'}
      {...restProps}
    >
      <MotiText
        animate={useDerivedValue(
          () => ({
            translateY: focused.value === 1 || hasValue ? 1 : 20,
            translateX: focused.value === 1 || hasValue ? -2 : 15,
            scale: focused.value === 1 || hasValue ? 0.8 : 1,
          }),
          [focused, hasValue],
        )}
        transition={{
          type: 'timing',
        }}
        style={{
          color: isInvalid ? colors.red[500] : colors.current,
          position: 'absolute',
          top: 0,
          zIndex: -10,
          fontFamily: 'Roboto-Bold',
          alignItems: 'flex-start',
          textAlign: 'center',
          fontSize: 18,
        }}
      >
        {label}
      </MotiText>
      {multiline ? children : <View className='h-full w-full'>{children}</View>}

      <FieldErrorMessage error={error} />
    </View>
  );
});

export { FieldSet };
