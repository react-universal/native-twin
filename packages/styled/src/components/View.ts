import type { PropsFrom } from '@native-twin/helpers';
import { View as RNView } from 'react-native';
import { useStyledComponent } from '../styled/useStyledComponent';
import type { StyledConfiguration } from '../types/styled.types';
import { getNormalizeConfig } from '../utils/component.config';
import { copyComponentProperties } from './utils/_hoistComponentProps';

const mapping = {
  className: 'style',
} satisfies StyledConfiguration<typeof RNView>;

export const View = copyComponentProperties(RNView, (props: PropsFrom<typeof RNView>) => {
  const config = getNormalizeConfig(mapping);
  return useStyledComponent(RNView, props, config);
});
