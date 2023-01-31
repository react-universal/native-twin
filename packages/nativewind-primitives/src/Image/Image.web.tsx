import { createStyledComponent } from '@react-universal/nativewind-utils';
import NativeImage from 'next/legacy/image';
import { IImageProps, sizes, variants } from './types';

export const ImageWrapper = ({
  size = 'default',
  variant = 'default',
  src,
  ...props
}: IImageProps) => {
  return (
    <NativeImage
      src={src}
      className={`${variants[variant]} ${sizes[size]} aspect-square`}
      {...props}
    />
  );
};

export const Image = createStyledComponent(ImageWrapper);
