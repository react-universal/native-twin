import { type ImageProps, Image as RNImage } from 'react-native';
import { useStyledComponent } from '../styled/useStyledComponent';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './utils/_hoistComponentProps';

const mapping: StylableComponentConfigOptions<typeof RNImage> = {
  className: 'style',
};

export const Image = copyComponentProperties(RNImage, (props: ImageProps) => {
  const config = getNormalizeConfig(mapping);
  return useStyledComponent(RNImage, props, config);
});

export default Image;
