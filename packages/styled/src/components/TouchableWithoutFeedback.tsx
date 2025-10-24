import {
  TouchableWithoutFeedback as RNTouchableWithoutFeedback,
  type TouchableWithoutFeedbackProps,
} from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

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
