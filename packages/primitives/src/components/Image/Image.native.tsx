import { forwardRef } from 'react';
import { Image as NativeImage } from 'react-native';
import { styled } from '@react-universal/core';
import type { IImageProps } from './types';

const StyledImage = styled(NativeImage);

export const Image = forwardRef<unknown, IImageProps>(function ImageWrapper(
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
