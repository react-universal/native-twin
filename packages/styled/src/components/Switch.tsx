import { Switch as RNSwitch, type SwitchProps } from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping = {
  className: 'style',
} satisfies StylableComponentConfigOptions<typeof RNSwitch>;

export const Switch = copyComponentProperties(RNSwitch, (props: SwitchProps) => {
  const config = getNormalizeConfig(mapping);
  return useStyledComponent(RNSwitch, props, config);
});

export default Switch;
