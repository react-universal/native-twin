import { type ImageBackgroundProps, ImageBackground as RNImageBackground } from 'react-native';
import { useStyledComponent } from '../styled/useStyledComponent';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './utils/_hoistComponentProps';

const mapping: StylableComponentConfigOptions<typeof RNImageBackground> = {
  className: {
    target: 'style',
    nativeStyleToProp: {
      backgroundColor: true,
    },
  },
};

export const ImageBackground = copyComponentProperties(
  RNImageBackground,
  (props: ImageBackgroundProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNImageBackground, props, config);
  },
);

export default ImageBackground;
