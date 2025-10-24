import {
  type KeyboardAvoidingViewProps,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping: StylableComponentConfigOptions<typeof RNKeyboardAvoidingView> = {
  className: {
    target: 'style',
  },
};

export const KeyboardAvoidingView = copyComponentProperties(
  RNKeyboardAvoidingView,
  (props: KeyboardAvoidingViewProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNKeyboardAvoidingView, props, config);
  },
);

export default KeyboardAvoidingView;
