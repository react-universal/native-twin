import { type ButtonProps, Button as RNButton } from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping: StylableComponentConfigOptions<typeof RNButton> = {
  className: {
    target: false,
    nativeStyleToProp: {
      color: 'color',
    },
  },
};

export const Button = copyComponentProperties(RNButton, (props: ButtonProps) => {
  const config = getNormalizeConfig(mapping);
  return useStyledComponent(RNButton, props, config);
});

export default Button;
