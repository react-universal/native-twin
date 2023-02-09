import { forwardRef } from 'react';
import { Image as NativeImage } from 'react-native';
import { createStyledComponent } from '../../utils/createStyledComponent';
import type { IImageProps } from './types';

const StyledImage = createStyledComponent(NativeImage);

export const Image = forwardRef<NativeImage, IImageProps>(function ImageWrapper(
  { className, src, ...props },
  ref,
) {
  return (
    // @ts-expect-error
    <StyledImage
      ref={ref}
      source={{ uri: src.toString() }}
      className={className}
      resizeMode='cover'
      {...props}
    />
  );
});
