import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping: StylableComponentConfigOptions<typeof RNTextInput> = {
  className: {
    target: 'style',
    nativeStyleToProp: {
      textAlign: true,
    },
  },
};

export const TextInput = copyComponentProperties(RNTextInput, (props: TextInputProps) => {
  const config = getNormalizeConfig(mapping);
  return useStyledComponent(RNTextInput, props, config);
});

export default TextInput;
