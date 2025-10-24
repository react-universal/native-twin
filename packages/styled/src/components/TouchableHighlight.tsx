import {
  TouchableHighlight as RNTouchableHighlight,
  type TouchableHighlightProps,
} from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping: StylableComponentConfigOptions<typeof RNTouchableHighlight> = {
  className: 'style',
};

export const TouchableHighlight = copyComponentProperties(
  RNTouchableHighlight,
  (props: TouchableHighlightProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNTouchableHighlight, props, config);
  },
);

export default TouchableHighlight;
