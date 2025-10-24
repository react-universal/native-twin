import { type PressableProps, Pressable as RNPressable } from 'react-native';
import type { StylableComponentConfigOptions } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './_hoistComponentProps';
import { useStyledComponent } from './useStyledComponent';

const mapping: StylableComponentConfigOptions<typeof RNPressable> = {
  className: 'style',
};

export const Pressable = copyComponentProperties(RNPressable, (props: PressableProps) => {
  const config = getNormalizeConfig(mapping);
  return useStyledComponent(RNPressable, props, config);
});

export default Pressable;
