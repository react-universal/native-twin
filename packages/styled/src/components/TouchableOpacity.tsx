import { TouchableOpacity as RNTouchableOpacity, type TouchableOpacityProps } from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping: StylableComponentConfigOptions<typeof RNTouchableOpacity> = {
  className: 'style',
};

export const TouchableOpacity = copyComponentProperties(
  RNTouchableOpacity,
  (props: TouchableOpacityProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNTouchableOpacity, props, config);
  },
);

export default TouchableOpacity;
