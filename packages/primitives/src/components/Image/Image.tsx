import { Image as NativeImage } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const Image = styled(NativeImage) as ForwardedStyledComponent<NativeImage>;

export { Image };
