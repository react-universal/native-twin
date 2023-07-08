import { cva, VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

export const buttonStyles = cva(clsx('rounded-xl overflow-hidden hover:opacity-70'), {
  variants: {
    variant: {
      primary: clsx('bg-weathermatic-500'),
      secondary: clsx('bg-white'),
      primaryDark: clsx('bg-weathermatic-500'),
    },
    size: {
      default: clsx('w-full h-14 android:pt-3 ios:pt-4 px-3'),
      small: clsx('h-10'),
      bigger: clsx(
        'pt-3 pb-5 my-3 mx-2',
        'shadow-md rounded-3xl',
        'dark:bg-weathermatic-500',
        'desktop:w-44 desktop:h-44',
        'w-40 h-36',
      ),
    },
    isDisabled: {
      true: clsx('bg-gray-400 hover:opacity-100'),
      false: clsx(''),
    },
    layout: {
      default: clsx('justify-center items-center'),
      col: clsx('items-center justify-between'),
    },
  },
  defaultVariants: {
    variant: 'primary',
    layout: 'default',
    size: 'default',
  },
});

const buttonTextStyles = cva('text-[16px] font-bold', {
  variants: {
    variant: {
      primary: clsx('text-gray-100 text-center'),
      secondary: clsx('text-weathermatic-500'),
      primaryDark: clsx('text-gray-200'),
    },
    isDisabled: {
      true: clsx('text-gray-500'),
      false: clsx(''),
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export { buttonTextStyles };

export type IButtonVariantsProps = VariantProps<typeof buttonStyles>;
