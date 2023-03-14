import { forwardRef, ReactNode } from 'react';
import { Span, View, ViewProps } from '@universal-labs/primitives';
import clsx from 'clsx';
import type { FieldError } from 'react-hook-form';
import { FieldErrorMessage } from '../error-message';

interface IFieldSetProps extends ViewProps {
  label: string;
  isInvalid: boolean;
  hasValue: boolean;
  focused: { value: number };
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
      className={clsx(
        'relative my-2 w-full items-start justify-end',
        'overflow-hidden rounded-xl',
        'bg-gray-100 pt-2',
        multiline ? 'h-auto' : 'h-16',
        isInvalid ? 'border-error animate-shake border-[1px]' : '',
        className,
        isDisabled ? 'opacity-70' : '',
      )}
      {...restProps}
    >
      <Span
        className={clsx(
          'font-bold',
          'absolute top-0',
          '-z-10 items-start',
          'text-center text-lg',
          'transition-all',
          isInvalid ? 'text-error animate-shake' : 'text-primary-50',
          focused.value === 1 || hasValue
            ? 'translate-[5px] scale-90'
            : 'translate-y-[20px] scale-100',
        )}
      >
        {label}
      </Span>
      {multiline ? children : <View className='h-full w-full'>{children}</View>}
      <FieldErrorMessage error={error} />
    </View>
  );
});

export { FieldSet };
