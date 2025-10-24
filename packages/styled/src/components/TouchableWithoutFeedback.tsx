import {
  TouchableWithoutFeedback as RNTouchableWithoutFeedback,
  type TouchableWithoutFeedbackProps,
} from 'react-native';
import { useStyledComponent } from '../styled/useStyledComponent';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './utils/_hoistComponentProps';

const mapping: StylableComponentConfigOptions<typeof RNTouchableWithoutFeedback> = {
  className: 'style',
};

export const TouchableWithoutFeedback = copyComponentProperties(
  RNTouchableWithoutFeedback,
  (props: TouchableWithoutFeedbackProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNTouchableWithoutFeedback, props, config);
  },
);

export default TouchableWithoutFeedback;
