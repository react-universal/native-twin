import { Text as RNText, type TextProps } from 'react-native';
import { useStyledComponent } from '../styled/useStyledComponent';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './utils/_hoistComponentProps';

const mapping = {
  className: 'style',
} satisfies StylableComponentConfigOptions<typeof RNText>;

export const Text = copyComponentProperties(RNText, (props: TextProps) => {
  const config = getNormalizeConfig(mapping);
  return useStyledComponent(RNText, props, config);
});

export default Text;
