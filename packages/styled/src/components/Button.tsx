import { type ButtonProps, Button as RNButton } from 'react-native';
import { useStyledComponent } from '../styled/useStyledComponent';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './utils/_hoistComponentProps';

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
