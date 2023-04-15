import type { ComponentProps } from 'react';
import { View as ReactNativeView } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const View = styled(ReactNativeView) as ForwardedStyledComponent<ReactNativeView>;

type ViewProps = ComponentProps<typeof View>;

export type { ViewProps };

export default View;
