import {
  type ActivityIndicatorProps,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native';
import { useStyledComponent } from '../styled/useStyledComponent';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './utils/_hoistComponentProps';

const mapping: StylableComponentConfigOptions<typeof RNActivityIndicator> = {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: 'color',
    },
  },
};

export const ActivityIndicator = copyComponentProperties(
  RNActivityIndicator,
  (props: ActivityIndicatorProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNActivityIndicator, props, config);
  },
);

export default ActivityIndicator;
