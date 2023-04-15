import type { ComponentProps } from 'react';
import { ScrollView as ReactNativeScrollView } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const ScrollView = styled(
  ReactNativeScrollView,
) as ForwardedStyledComponent<ReactNativeScrollView>;

type ScrollViewProps = ComponentProps<typeof ScrollView>;

export type { ScrollViewProps };

export default ScrollView;
