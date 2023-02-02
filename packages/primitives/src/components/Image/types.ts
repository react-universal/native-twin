import type { ImageProps } from 'next/legacy/image';

export const sizes = {
  default: 'w-16 h-16',
  sm: 'w-6 h-6',
  lg: 'w-20 h-20',
  xl: 'w-36 h-36',
};

export const variants = {
  default: '',
  avatar: 'rounded-full overflow-hidden',
};

export interface IImageProps extends ImageProps {
  size?: 'default' | 'sm' | 'lg' | 'xl';
  variant?: 'default' | 'avatar';
}
