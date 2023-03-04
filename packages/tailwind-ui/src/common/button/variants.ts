import { cva, VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

export const buttonStyles = cva(clsx('rounded-md overflow-hidden hover:opacity-70'), {
  variants: {
    variant: {
      primary: clsx('bg-green-50 dark:bg-green-300'),
      secondary: clsx('bg-white'),
      primaryDark: clsx('bg-green-400'),
    },
    size: {
      default: clsx('w-full h-12 px-3'),
      small: clsx('h-10'),
      bigger: clsx(
        'pt-3 pb-5 my-3 mx-2',
        'shadow-md rounded-3xl',
        'desktop:w-44 desktop:h-44',
        'w-40 h-36',
      ),
    },
    isDisabled: {
      true: clsx('opacity-70'),
      false: clsx('opacity-100'),
    },
    layout: {
      default: clsx('justify-center items-center'),
      col: clsx('items-center justify-between'),
    },
  },
  defaultVariants: {
    layout: 'default',
    size: 'default',
  },
});

const buttonTextStyles = cva('text-lg', {
  variants: {
    variant: {
      primary: clsx('text-gray-100'),
      secondary: clsx('text-primary-50'),
      primaryDark: clsx('text-gray-200'),
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export { buttonTextStyles };

export type IButtonVariantsProps = VariantProps<typeof buttonStyles>;
